// Global variables
let busDetailsData = null; // To store full bus details from API
let farePerSeat = 0;
let busIdParam = null;
let sourceStopIdParam = null;
let sourceStopNameParam = null; // To store from URL query
let destinationStopNameParam = null; // To store from URL query
let destinationStopIdParam = null;
let journeyDateParam = null;

// DOM Elements
const busNameNumberEl = document.getElementById('busNameNumber');
const busRouteEl = document.getElementById('busRoute');
const busTypeEl = document.getElementById('busType');
const sourceStopNameDisplayEl = document.getElementById('sourceStopNameDisplay');
const destinationStopNameDisplayEl = document.getElementById('destinationStopNameDisplay');
const journeyDateDisplayEl = document.getElementById('journeyDateDisplay');
const numberOfSeatsInput = document.getElementById('numberOfSeats');
const farePerSeatEl = document.getElementById('farePerSeat');
const totalAmountEl = document.getElementById('totalAmount');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const bookingFormEl = document.getElementById('bookingForm');
const bookingConfirmationEl = document.getElementById('bookingConfirmation');
const bookingSuccessMessageEl = document.getElementById('bookingSuccessMessage');
const qrCodeElement = document.getElementById('qrcode');
const downloadTicketBtn = document.getElementById('downloadTicketBtn');
const errorMessageAreaEl = document.getElementById('errorMessageArea');
const loadingIndicatorEl = document.getElementById('loadingIndicator');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    busIdParam = urlParams.get('busId');
    sourceStopIdParam = urlParams.get('sourceStopId');
    sourceStopNameParam = urlParams.get('sourceName');
    destinationStopNameParam = urlParams.get('destinationName');
    destinationStopIdParam = urlParams.get('destinationStopId');
    journeyDateParam = urlParams.get('journeyDate');
    const fareParam = urlParams.get('fare');

    if (!busIdParam || !sourceStopIdParam || !destinationStopIdParam || !journeyDateParam || !fareParam) {
        displayError('Booking details are incomplete. Please go back and select a bus.');
        if(confirmBookingBtn) confirmBookingBtn.disabled = true;
        return;
    }

    // 2. Store and display initial details
    farePerSeat = parseFloat(fareParam);
    if(farePerSeatEl) farePerSeatEl.textContent = farePerSeat.toFixed(2);
    if (sourceStopNameDisplayEl) sourceStopNameDisplayEl.textContent = sourceStopNameParam || 'N/A';
    if (destinationStopNameDisplayEl) destinationStopNameDisplayEl.textContent = destinationStopNameParam || 'N/A';
    if (journeyDateDisplayEl) journeyDateDisplayEl.textContent = new Date(journeyDateParam).toLocaleDateString();


    // 3. Fetch full bus details
    if (busIdParam) {
        fetchAndDisplayBusDetails(busIdParam);
    } else {
        displayError('Bus ID is missing. Cannot fetch bus details.');
        if(confirmBookingBtn) confirmBookingBtn.disabled = true;
    }

    // 4. Initialize number of seats and total amount
    if(numberOfSeatsInput) numberOfSeatsInput.value = 1;
    updateTotalAmount();

    // 5. Add event listeners
    if(numberOfSeatsInput) numberOfSeatsInput.addEventListener('input', updateTotalAmount);
    if(confirmBookingBtn) confirmBookingBtn.addEventListener('click', handleConfirmBooking);
    if(downloadTicketBtn) downloadTicketBtn.addEventListener('click', () => {
        const confirmationContent = document.getElementById('bookingConfirmation');
        if (confirmationContent) {
            // Temporarily hide other elements for cleaner print
            const originalHeaderDisplay = document.querySelector('header').style.display;
            const originalFooterDisplay = document.querySelector('footer').style.display;
            const originalMainPadding = document.querySelector('main').style.padding;

            document.querySelector('header').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            document.querySelector('main').style.padding = '0'; // Remove padding for print
            
            // Clone the confirmation section to avoid issues with live elements
            const printableContent = confirmationContent.cloneNode(true);
            // Add some print-specific styles
            const style = document.createElement('style');
            style.innerHTML = `
                @media print {
                    body * { visibility: hidden; }
                    .printable-ticket, .printable-ticket * { visibility: visible; }
                    .printable-ticket { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    #downloadTicketBtn, button { display: none !important; } /* Hide button in print */
                }
            `;
            document.head.appendChild(style);
            // Wrap content in a div for printing
            const printContainer = document.createElement('div');
            printContainer.classList.add('printable-ticket');
            printContainer.appendChild(printableContent);
            document.body.appendChild(printContainer);

            window.print();

            // Clean up: remove the cloned content and style, restore layout
            document.body.removeChild(printContainer);
            document.head.removeChild(style);
            document.querySelector('header').style.display = originalHeaderDisplay;
            document.querySelector('footer').style.display = originalFooterDisplay;
            document.querySelector('main').style.padding = originalMainPadding;

        } else {
            alert("No booking confirmation to print.");
        }
    });
});

async function fetchAndDisplayBusDetails(busId) {
    showLoading(true, 'Fetching bus details...');
    try {
        // Use the global fetchWithAuth if it's available from auth.js, or define locally
        const response = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : localFetchWithAuth)(`/api/buses/${busId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch bus details.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json(); // Renamed to avoid conflict
        
        if (result && result.data) {
            busDetailsData = result.data; // Store for later use if needed
            if(busNameNumberEl) busNameNumberEl.textContent = `${busDetailsData.busNumber} (${busDetailsData.busName || ''})`;
            if(busRouteEl) busRouteEl.textContent = busDetailsData.route?.name || 'N/A';
            if(busTypeEl) busTypeEl.textContent = busDetailsData.busType || 'N/A';
        } else {
            throw new Error('Bus data is not in the expected format.');
        }
    } catch (error) {
        displayError(`Error fetching bus details: ${error.message}`);
        if(busNameNumberEl) busNameNumberEl.textContent = "Error loading details";
    } finally {
        showLoading(false);
    }
}

function updateTotalAmount() {
    if (!numberOfSeatsInput || !totalAmountEl) return;
    const numberOfSeats = parseInt(numberOfSeatsInput.value, 10);
    if (isNaN(numberOfSeats) || numberOfSeats < 1) {
        totalAmountEl.textContent = '0.00';
        return;
    }
    const total = numberOfSeats * farePerSeat;
    totalAmountEl.textContent = total.toFixed(2);
}

async function handleConfirmBooking() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        displayError('You must be logged in to make a booking. Redirecting to login...');
        setTimeout(() => window.location.href = 'login.html?redirect=booking.html' + encodeURIComponent(window.location.search), 3000);
        return;
    }

    const numberOfSeats = parseInt(numberOfSeatsInput.value, 10);
    if (isNaN(numberOfSeats) || numberOfSeats < 1) {
        displayError('Please enter a valid number of seats.');
        return;
    }
    const totalAmount = parseFloat(totalAmountEl.textContent);

    const bookingPayload = {
        busId: busIdParam,
        sourceStopId: sourceStopIdParam,
        destinationStopId: destinationStopIdParam,
        numberOfSeats: numberOfSeats,
        journeyDate: journeyDateParam,
        totalAmount: totalAmount
    };

    showLoading(true, 'Confirming your booking...');
    if(confirmBookingBtn) confirmBookingBtn.disabled = true;

    try {
        const response = await (typeof fetchWithAuth === 'function' ? fetchWithAuth : localFetchWithAuth)('/api/bookings', { // Assuming fetchWithAuth handles token
            method: 'POST',
            body: JSON.stringify(bookingPayload)
        });


        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Booking failed. Please try again.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const bookingResult = await response.json();
        if (bookingResult.success && bookingResult.data) {
            displayBookingConfirmation(bookingResult.data);
        } else {
            throw new Error(bookingResult.message || 'Booking confirmation data not received.');
        }

    } catch (error) {
        displayError(`Booking Error: ${error.message}`);
    } finally {
        showLoading(false);
        if(confirmBookingBtn) confirmBookingBtn.disabled = false;
    }
}

function displayBookingConfirmation(bookingDetails) {
    if(bookingFormEl) bookingFormEl.style.display = 'none';
    if(bookingConfirmationEl) bookingConfirmationEl.style.display = 'block';
    if(errorMessageAreaEl) errorMessageAreaEl.style.display = 'none';

    if(bookingSuccessMessageEl) bookingSuccessMessageEl.textContent = `Booking successful! Your Booking ID is: ${bookingDetails._id}.`;

    if(qrCodeElement) {
        qrCodeElement.innerHTML = '';
        if (bookingDetails.qrCodeData) {
            new QRCode(qrCodeElement, {
                text: bookingDetails.qrCodeData,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrCodeElement.innerHTML = "<p>QR Code not available.</p>";
        }
    }
}

function displayError(message) {
    if(errorMessageAreaEl) {
        errorMessageAreaEl.textContent = message;
        errorMessageAreaEl.style.display = 'block';
    }
}

function showLoading(isLoading, message = 'Processing...') {
    if(loadingIndicatorEl) {
        if (isLoading) {
            loadingIndicatorEl.textContent = message;
            loadingIndicatorEl.style.display = 'block';
        } else {
            loadingIndicatorEl.style.display = 'none';
        }
    }
}

// Local fetchWithAuth in case auth.js is not loaded or function is not global
async function localFetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

// Ensure currentYear is set (if not already in main.js)
document.addEventListener('DOMContentLoaded', () => {
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan && !currentYearSpan.textContent) { // Check if not already set
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
