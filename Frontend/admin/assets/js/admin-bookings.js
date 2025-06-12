// DOM Elements
const bookingsTableBody = document.getElementById('bookings-table-body');
const bookingsPaginationControlsContainer = document.getElementById('bookings-pagination-controls');
const loadingIndicatorBookings = document.getElementById('loadingIndicatorBookings');
const statusMessageBookings = document.getElementById('statusMessageBookings');
const noBookingsMessage = document.getElementById('no-bookings-message');

let currentPage = 1;
const ITEMS_PER_PAGE = 10; // Or make this configurable

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Admin auth check can be called from admin-common.js or handled by inline script
    // checkAdminAuth();
    fetchBookingsAndRender(currentPage);
});

// --- Authentication (Basic check, primary check is inline in HTML) ---
// function checkAdminAuth() { ... } // Removed, assuming it's in admin-common.js or HTML

// --- Data Fetching and Rendering ---
async function fetchBookingsAndRender(page = 1) {
    showAdminLoading('loadingIndicatorBookings', true, 'Loading bookings...'); // Use generic helper
    displayAdminMessage('statusMessageBookings', '', 'clear'); // Use generic helper
    if(noBookingsMessage) noBookingsMessage.style.display = 'none';
    currentPage = page;

    try {
        const response = await localAdminFetchWithAuth(`/api/bookings/all?page=${currentPage}&limit=${ITEMS_PER_PAGE}`); // Uses shared fetch
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch bookings.');
        }

        if (result.success && result.data) {
            renderBookingsTable(result.data);
            renderPaginationControls(result.pagination);
        } else {
            displayAdminMessage('statusMessageBookings', result.message || 'No bookings found or error in response.', 'info');
            if (bookingsTableBody) bookingsTableBody.innerHTML = '';
            if (bookingsPaginationControlsContainer) bookingsPaginationControlsContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        displayAdminMessage('statusMessageBookings', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorBookings', false);
    }
}

function renderBookingsTable(bookings) {
    if (!bookingsTableBody) return;
    bookingsTableBody.innerHTML = '';

    if (bookings.length === 0) {
        if(noBookingsMessage) noBookingsMessage.style.display = 'block';
        return;
    }

    bookings.forEach(booking => {
        const row = bookingsTableBody.insertRow();
        row.insertCell().textContent = booking._id;

        const user = booking.user;
        row.insertCell().textContent = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'N/A';
        row.insertCell().textContent = user ? user.email : 'N/A';

        const bus = booking.bus;
        row.insertCell().textContent = bus ? bus.busNumber : 'N/A';
        row.insertCell().textContent = bus ? bus.busType : 'N/A';
        row.insertCell().textContent = bus && bus.route ? bus.route.name : 'N/A';

        row.insertCell().textContent = booking.sourceStop ? booking.sourceStop.name : 'N/A';
        row.insertCell().textContent = booking.destinationStop ? booking.destinationStop.name : 'N/A';

        row.insertCell().textContent = new Date(booking.journeyDate).toLocaleDateString();
        row.insertCell().textContent = booking.numberOfSeats;
        row.insertCell().textContent = booking.totalAmount.toFixed(2);
        row.insertCell().textContent = booking.status;
        row.insertCell().textContent = new Date(booking.createdAt).toLocaleString();
    });
}

function renderPaginationControls(paginationInfo) {
    if (!bookingsPaginationControlsContainer || !paginationInfo) return;
    bookingsPaginationControlsContainer.innerHTML = ''; // Clear existing

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = paginationInfo;

    if (totalPages <= 1) return; // No controls needed for 0 or 1 page

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = !hasPrevPage;
    if(!hasPrevPage) prevButton.classList.add('disabled');
    prevButton.addEventListener('click', () => fetchBookingsAndRender(currentPage - 1));
    bookingsPaginationControlsContainer.appendChild(prevButton);

    // Page Numbers (simplified for now, can add ellipsis later if many pages)
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
            pageButton.disabled = true;
        }
        pageButton.addEventListener('click', () => fetchBookingsAndRender(i));
        bookingsPaginationControlsContainer.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = !hasNextPage;
    if(!hasNextPage) nextButton.classList.add('disabled');
    nextButton.addEventListener('click', () => fetchBookingsAndRender(currentPage + 1));
    bookingsPaginationControlsContainer.appendChild(nextButton);
}


// --- UI Helper Functions ---
// Removed showAdminBookingLoading and displayAdminBookingMessage as they will use generic versions
// from admin-common.js

// Removed localAdminFetchWithAuth as it will use the one from admin-common.js
