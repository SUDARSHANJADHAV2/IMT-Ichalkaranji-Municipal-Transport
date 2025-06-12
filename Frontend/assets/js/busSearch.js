// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDatePicker();
    initSearchForm();
    initSwitchButton();
    initFilters();
    initSorting();
    initPagination();
    initMobileMenu();
    
    // Show search results section (it would normally be hidden until search is performed)
    // For demo purposes, we're showing it immediately
    document.getElementById('search-results').style.display = 'flex';
    
    // Set today's date as the default date
    setDefaultDate();
    
    // Update the search results summary (demo purposes)
    updateSearchSummary();
});

/**
 * Initialize the date picker with min date
 */
function initDatePicker() {
    const searchDate = document.getElementById('search-date');
    
    // Set min date to today
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    // Format month and day to have leading zeros if needed
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    
    const formattedDate = `${year}-${month}-${day}`;
    searchDate.setAttribute('min', formattedDate);
}

/**
 * Set default date to today
 */
function setDefaultDate() {
    const searchDate = document.getElementById('search-date');
    
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    // Format month and day to have leading zeros if needed
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    
    const formattedDate = `${year}-${month}-${day}`;
    searchDate.value = formattedDate;
}

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Pagination State
let currentPage = 1;
const ITEMS_PER_PAGE = 5; // Or make this configurable if needed

// Function to show loading indicator
function showLoadingIndicator() {
    const busList = document.querySelector('.bus-list');
    if (busList) {
        // Ensure other messages are cleared
        busList.innerHTML = '<p class="loading-message">Loading buses...</p>';
    }
    // Show the results section to display the loading message
    const resultsSection = document.getElementById('search-results');
    if (resultsSection) {
        resultsSection.style.display = 'flex';
    }
}

// Function to hide loading indicator
function hideLoadingIndicator() {
    const loadingMessage = document.querySelector('.bus-list .loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Function to display error message or no results
function displayUserMessage(message, type = 'info') {
    const busList = document.querySelector('.bus-list');
    if (busList) {
        busList.innerHTML = `<p class="user-message ${type}">${message}</p>`;
    }
     // Show the results section to display the message
    const resultsSection = document.getElementById('search-results');
    if (resultsSection) {
        resultsSection.style.display = 'flex';
    }
}

/**
 * Performs the actual search operation by fetching data from the API and rendering results.
 * @param {string} apiUrl The fully constructed API URL for the search.
 * @param {string} source Current source for summary update.
 * @param {string} destination Current destination for summary update.
 * @param {string} date Current date for summary update.
 */
async function performSearchAndRender(apiUrl, source, destination, date) {
    const busList = document.querySelector('.bus-list');
    if (!busList) {
        console.error('Bus list container .bus-list not found');
        return;
    }

    showLoadingIndicator();
    // Update summary to indicate search is in progress
    // Use current source, destination, date from form for summary, as apiUrl might just have IDs or be complex
    const currentSource = document.getElementById('search-source').value.trim();
    const currentDestination = document.getElementById('search-destination').value.trim();
    const currentDate = document.getElementById('search-date').value;
    // Append page and limit to the API URL for all searches
    const paginatedApiUrl = `${apiUrl}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

    updateSearchSummary(currentSource, currentDestination, currentDate, "...");

    try {
        const response = await fetch(paginatedApiUrl); // Use URL with pagination params

        if (!response.ok) {
            let errorMsg = 'Failed to fetch buses. Please try again.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || `HTTP error! Status: ${response.status}`;
            } catch (jsonError) {
                errorMsg = `HTTP error! Status: ${response.status} - ${response.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const responseData = await response.json();
        const busesData = responseData.data || []; // Buses for the current page
        const paginationInfo = responseData.pagination;

        hideLoadingIndicator();
        renderBusItems(busesData); // Renders only the current page's items

        if (paginationInfo) {
            updateSearchSummary(currentSource, currentDestination, currentDate, paginationInfo.totalItems);
            renderPaginationControls(paginationInfo);
        } else {
            // Fallback if pagination info is missing, though backend should always provide it
            updateSearchSummary(currentSource, currentDestination, currentDate, busesData.length);
            renderPaginationControls({ currentPage: 1, totalPages: 1, totalItems: busesData.length });
        }


        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
            resultsSection.style.display = 'flex';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

    } catch (error) {
        console.error('Error fetching buses:', error);
        hideLoadingIndicator();
        displayUserMessage(error.message || 'An unexpected error occurred. Please try again.', 'error');
        updateSearchSummary(currentSource, currentDestination, currentDate, 0);
    }
}


/**
 * Initialize the search form submission
 */
function initSearchForm() {
    const searchForm = document.getElementById('search-form');
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const source = document.getElementById('search-source').value.trim();
        const destination = document.getElementById('search-destination').value.trim();
        const date = document.getElementById('search-date').value;
        
        if (!source || !destination || !date) {
            showToast('Please fill in all search fields.', 'error');
            return;
        }
        
        // Construct base API URL for initial search
        let apiUrl = `${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
        
        // Append any existing filter parameters from filter controls
        const filterParams = collectFilterParameters();
        if (filterParams) {
            apiUrl += `&${filterParams}`;
        }

        // Append sort parameters if they exist
        if (currentSortState.field && currentSortState.order) {
            apiUrl += `&sortBy=${currentSortState.field}&sortOrder=${currentSortState.order}`;
        }
        
        currentPage = 1; // Reset to page 1 for new search
        performSearchAndRender(apiUrl, source, destination, date);
    });
}

// Function to render bus items
function renderBusItems(busesData) {
    const busList = document.querySelector('.bus-list');
    if (!busList) {
        console.error("Bus list container .bus-list not found.");
        return;
    }
    busList.innerHTML = ''; // Clear previous results or messages

    if (!busesData || busesData.length === 0) {
        // displayUserMessage is preferred but if it's not available in this scope yet, use simple innerHTML
        if (typeof displayUserMessage === 'function') {
            displayUserMessage('No buses found for your criteria.', 'info');
        } else {
            busList.innerHTML = '<p class="user-message info">No buses found for your criteria.</p>';
        }
        return;
    }

    busesData.forEach(bus => {
        const busItem = document.createElement('div');
        busItem.className = 'bus-item';

        // Gracefully handle potentially missing journeyInfo or its properties
        const departureTime = bus.journeyInfo?.departureTime || 'N/A';
        const arrivalTime = bus.journeyInfo?.arrivalTime || 'N/A';
        // Ensure duration is handled: if it's a number, append "mins"; if not, display as is or 'N/A'
        let durationDisplay = 'N/A';
        if (bus.journeyInfo?.duration) {
            if (typeof bus.journeyInfo.duration === 'number') {
                durationDisplay = `${bus.journeyInfo.duration} mins`;
            } else {
                durationDisplay = bus.journeyInfo.duration; // If it's already a formatted string
            }
        }

        const fare = bus.journeyInfo?.fare ? `₹${bus.journeyInfo.fare}` : 'N/A';
        const busTypeClass = bus.busType ? bus.busType.toLowerCase().replace(/\s+/g, '-') : 'unknown-type';
        const busTypeName = bus.busType || 'Unknown Type';
        const routeName = bus.route?.name || 'Unknown Route';
        const busNumber = bus.busNumber || 'N/A'; // Ensure busNumber is also handled
        const busId = bus._id || '';
        const sourceStopId = bus.journeyInfo?.sourceStop?._id || '';
        const sourceStopName = bus.journeyInfo?.sourceStop?.name || 'N/A';
        const destinationStopId = bus.journeyInfo?.destinationStop?._id || '';
        const destinationStopName = bus.journeyInfo?.destinationStop?.name || 'N/A';

        // Corrected: Use only bus.journeyInfo.date which comes from the backend per search result
        const journeyDateForBooking = bus.journeyInfo?.date;
        if (!journeyDateForBooking) {
            console.error('Error: bus.journeyInfo.date is missing for bus:', bus);
            // Button event listener will handle missing journeyDateForBooking by alerting.
        }
        const segmentFare = bus.journeyInfo?.fare || 0;


        busItem.innerHTML = `
            <div class="bus-info">
                <div class="bus-details">
                    <h3>${busNumber} - ${routeName}</h3>
                    <p class="bus-type ${busTypeClass}">${busTypeName}</p>
                </div>
                <div class="timing">
                    <div class="departure">
                        <p>Departure</p>
                        <p class="time">${departureTime}</p>
                    </div>
                    <div class="arrival">
                        <p>Arrival</p>
                        <p class="time">${arrivalTime}</p>
                    </div>
                </div>
                <div class="duration">
                    <p>Duration</p>
                    <p class="duration-time">${durationDisplay}</p>
                </div>
            </div>
            <div class="bus-actions">
                <p class="fare">${fare}</p>
                <button class="btn btn-primary btn-book-now" data-bus-id="${busId}">Book Now</button>
            </div>
        `;

        const bookNowButton = busItem.querySelector('.btn-book-now');
        if (bookNowButton) {
            bookNowButton.addEventListener('click', function() {
                // Ensure all required data is available
                if (!busId || !sourceStopId || !destinationStopId || !journeyDateForBooking || segmentFare === undefined) {
                    // Changed alert to showToast for consistency
                    showToast('Essential booking information is missing or invalid. Cannot proceed.', 'error');
                    console.error("Missing data for booking:", {busId, sourceStopId, destinationStopId, journeyDateForBooking, segmentFare});
                    return;
                }

                const bookingParams = new URLSearchParams({
                    busId: busId,
                    sourceStopId: sourceStopId,
                    sourceName: sourceStopName,
                    destinationStopId: destinationStopId,
                    destinationName: destinationStopName,
                    journeyDate: journeyDateForBooking, // Use the corrected date
                    fare: segmentFare.toString() // Fare per seat for this segment
                });
                window.location.href = `booking.html?${bookingParams.toString()}`;
            });
        }
        busList.appendChild(busItem);
    });
}

/**
 * Initialize the switch button for source and destination
 */
function initSwitchButton() {
    const switchBtn = document.getElementById('switch-btn');
    
    switchBtn.addEventListener('click', function() {
        const sourceInput = document.getElementById('search-source');
        const destinationInput = document.getElementById('search-destination');
        
        // Swap values
        const tempValue = sourceInput.value;
        sourceInput.value = destinationInput.value;
        destinationInput.value = tempValue;
        
        // Add animation classes
        sourceInput.classList.add('switch-animation');
        destinationInput.classList.add('switch-animation');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            sourceInput.classList.remove('switch-animation');
            destinationInput.classList.remove('switch-animation');
        }, 500);
    });
}

/**
 * Initialize filters
 */
function initFilters() {
    // Price range slider
    const priceRange = document.getElementById('price-range');
    const maxPrice = document.getElementById('max-price');
    
    priceRange.addEventListener('input', function() {
        maxPrice.textContent = `₹${this.value}`;
    });
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    applyFiltersBtn.addEventListener('click', function() {
        const source = document.getElementById('search-source').value.trim();
        const destination = document.getElementById('search-destination').value.trim();
        const date = document.getElementById('search-date').value;

        if (!source || !destination || !date) {
            showToast('Please perform a search first (Source, Destination, Date) before applying filters.', 'warning');
            return;
        }
        
        let apiUrl = `${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
        
        const filterParams = collectFilterParameters();
        if (filterParams) {
            apiUrl += `&${filterParams}`;
        }

        // Append sort parameters
        if (currentSortState.field && currentSortState.order) {
            apiUrl += `&sortBy=${currentSortState.field}&sortOrder=${currentSortState.order}`;
        }
        
        currentPage = 1; // Reset to page 1 when filters change
        performSearchAndRender(apiUrl, source, destination, date);
        showToast('Filters applied. Searching...', 'info');
    });
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const priceRangeSlider = document.getElementById('price-range'); // Assuming this is your price slider

    resetFiltersBtn.addEventListener('click', function() {
        // Reset UI elements
        filterCheckboxes.forEach(checkbox => checkbox.checked = false);
        if (priceRangeSlider) {
             // Assuming 1000 is the default max price, adjust if needed based on your HTML
            const defaultMaxPrice = priceRangeSlider.max || 100;
            priceRangeSlider.value = defaultMaxPrice;
            if (maxPrice) maxPrice.textContent = `₹${defaultMaxPrice}`;
        }

        // Re-fetch search results without filters
        const source = document.getElementById('search-source').value.trim();
        const destination = document.getElementById('search-destination').value.trim();
        const date = document.getElementById('search-date').value;

        if (!source || !destination || !date) {
            showToast('Please ensure Source, Destination, and Date are filled to reset and show all results.', 'warning');
            // Optionally clear bus list if search criteria is missing
            const busList = document.querySelector('.bus-list');
            if (busList) busList.innerHTML = '';
            updateSearchSummary("N/A", "N/A", "N/A", 0);
            return;
        }
        
        const apiUrl = `${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
        // Also append sort parameters on reset, to maintain current sort order
        if (currentSortState.field && currentSortState.order) {
            apiUrl += `&sortBy=${currentSortState.field}&sortOrder=${currentSortState.order}`;
        }
        currentPage = 1; // Reset to page 1
        performSearchAndRender(apiUrl, source, destination, date);
        showToast('Filters reset. Showing all results for current search.', 'info');
    });
}


/**
 * Get checked values for a given name (e.g., 'departure', 'busType')
 * @param {string} name - The name attribute of the checkbox inputs.
 * @returns {string} Comma-separated string of checked values.
 */
function getCheckedValues(name) {
    const checked = [];
    document.querySelectorAll(`input[name="${name}"]:checked`).forEach(checkbox => {
        checked.push(checkbox.value);
    });
    return checked.join(','); // Return as comma-separated string
}

/**
 * Collects all filter parameters from the UI controls.
 * @returns {string} A URL query string part with all filter parameters.
 */
function collectFilterParameters() {
    const departureFilters = getCheckedValues('departure');
    const busTypeFilters = getCheckedValues('busType');
    // Ensure price range slider and its value element exist
    const priceRangeElement = document.getElementById('price-range');
    const maxPriceFilter = priceRangeElement ? priceRangeElement.value : null;

    const params = new URLSearchParams();

    if (departureFilters) {
        params.append('departure', departureFilters);
    }
    if (busTypeFilters) {
        params.append('busType', busTypeFilters);
    }
    // Ensure maxPriceFilter is not the default "max" value before appending
    // This depends on how you want to treat the max end of the slider.
    // If slider at max means "no price limit", then don't send it.
    // For now, sending it always if a value exists.
    if (maxPriceFilter && priceRangeElement && maxPriceFilter !== priceRangeElement.max) {
         // Or some other logic to determine if it's actively set.
         // For now, we send it if it's not the absolute max of the slider.
         // If you want to send it always, remove `&& maxPriceFilter !== priceRangeElement.max`
        params.append('maxPrice', maxPriceFilter);
    }
    
    return params.toString();
}


// Global variable to store current sort state
let currentSortState = {
    field: 'departure', // Default sort field, matches initial active button if any
    order: 'asc'        // Default sort order
};

/**
 * Initialize sorting functionality
 */
function initSorting() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sortByValue = this.getAttribute('data-sort');
            
            if (this.classList.contains('active')) {
                // If already active, toggle order
                currentSortState.order = (this.classList.contains('asc')) ? 'desc' : 'asc';
            } else {
                // If not active, set to this sort type and default to 'asc'
                currentSortState.field = sortByValue;
                currentSortState.order = 'asc';
            }

            // Update visual cues on buttons
            sortButtons.forEach(btn => {
                btn.classList.remove('active', 'asc', 'desc');
                // Clear existing sort indicators (like ::after content)
                // Reset text to original (e.g., "Departure" from "Departure ↑")
                const originalText = btn.getAttribute('data-sort').charAt(0).toUpperCase() + btn.getAttribute('data-sort').slice(1);
                btn.innerHTML = originalText;
            });

            this.classList.add('active');
            this.classList.add(currentSortState.order); // Add 'asc' or 'desc' class for potential CSS styling
            
            // Add visual indicator (arrow) using innerHTML
            let arrow = currentSortState.order === 'asc' ? ' &uarr;' : ' &darr;'; // Up or Down arrow Unicode
            this.innerHTML = this.getAttribute('data-sort').charAt(0).toUpperCase() + this.getAttribute('data-sort').slice(1) + arrow;


            // Get current search criteria
            const source = document.getElementById('search-source').value.trim();
            const destination = document.getElementById('search-destination').value.trim();
            const date = document.getElementById('search-date').value;

            if (!source || !destination || !date) {
                showToast('Please perform a search (Source, Destination, Date) before sorting.', 'warning');
                return;
            }
            
            // Base API URL
            let apiUrl = `${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
            
            // Append filter parameters
            const filterParams = collectFilterParameters();
            if (filterParams) {
                apiUrl += `&${filterParams}`;
            }
            
            // Append sort parameters
            apiUrl += `&sortBy=${currentSortState.field}&sortOrder=${currentSortState.order}`;
            
            currentPage = 1; // Reset to page 1 when sorting changes
            performSearchAndRender(apiUrl, source, destination, date);
        });
    });

    // Set initial active button state and visual indicator based on currentSortState
    const initialActiveButton = document.querySelector(`.sort-btn[data-sort="${currentSortState.field}"]`);
    if (initialActiveButton) {
        initialActiveButton.classList.add('active', currentSortState.order);
        let arrow = currentSortState.order === 'asc' ? ' &uarr;' : ' &darr;';
        initialActiveButton.innerHTML = initialActiveButton.getAttribute('data-sort').charAt(0).toUpperCase() + initialActiveButton.getAttribute('data-sort').slice(1) + arrow;
    }
}

// Client-side sorting functions removed as sorting is now backend-driven.
// function sortBusItems(sortType) { ... }
// function convertTimeToMinutes(timeStr) { ... }


function renderPaginationControls(paginationInfo) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ''; // Clear existing controls

    if (!paginationInfo || paginationInfo.totalPages <= 1) {
        return; // No controls needed for 0 or 1 page
    }

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = paginationInfo;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn prev-page';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevButton.disabled = !hasPrevPage;
    if (!hasPrevPage) prevButton.classList.add('disabled');
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            navigateToPage(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page Numbers Container
    const pageNumbersContainer = document.createElement('div');
    pageNumbersContainer.className = 'page-numbers';

    // Logic to display page numbers (e.g., first, last, current, and some around current)
    // Simple version: show all page numbers if not too many, else show ellipsis
    const MAX_VISIBLE_PAGES = 5;
    if (totalPages <= MAX_VISIBLE_PAGES) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbersContainer.appendChild(createPageButton(i, currentPage));
        }
    } else {
        // More complex logic for many pages (e.g., 1 ... 4 5 6 ... 10)
        pageNumbersContainer.appendChild(createPageButton(1, currentPage)); // First page
        if (currentPage > 3) {
            pageNumbersContainer.appendChild(createEllipsis());
        }
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage === 1) endPage = Math.min(totalPages -1, currentPage + 2);
        if (currentPage === totalPages) startPage = Math.max(2, currentPage -2);


        for (let i = startPage; i <= endPage; i++) {
            pageNumbersContainer.appendChild(createPageButton(i, currentPage));
        }

        if (currentPage < totalPages - 2) {
            pageNumbersContainer.appendChild(createEllipsis());
        }
        pageNumbersContainer.appendChild(createPageButton(totalPages, currentPage)); // Last page
    }
    paginationContainer.appendChild(pageNumbersContainer);


    // Next Button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn next-page';
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.disabled = !hasNextPage;
    if (!hasNextPage) nextButton.classList.add('disabled');
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            navigateToPage(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function createPageButton(pageNumber, currentPage) {
    const button = document.createElement('button');
    button.className = 'page-number';
    button.textContent = pageNumber;
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    button.addEventListener('click', () => navigateToPage(pageNumber));
    return button;
}

function createEllipsis() {
    const span = document.createElement('span');
    span.className = 'page-ellipsis';
    span.textContent = '...';
    return span;
}


function navigateToPage(page) {
    currentPage = page; // Update global currentPage

    // Re-build the API URL with all current search, filter, and sort parameters
    const source = document.getElementById('search-source').value.trim();
    const destination = document.getElementById('search-destination').value.trim();
    const date = document.getElementById('search-date').value;

    if (!source || !destination || !date) {
        showToast('Search criteria missing. Cannot change page.', 'warning');
        return;
    }

    let apiUrl = `${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;

    const filterParams = collectFilterParameters();
    if (filterParams) {
        apiUrl += `&${filterParams}`;
    }

    if (currentSortState.field && currentSortState.order) {
        apiUrl += `&sortBy=${currentSortState.field}&sortOrder=${currentSortState.order}`;
    }
    
    // performSearchAndRender will append page and limit from global currentPage and ITEMS_PER_PAGE
    performSearchAndRender(apiUrl, source, destination, date);
}


/**
 * Initialize pagination (placeholder, actual controls are built dynamically)
 */
function initPagination() {
    // The pagination container is now populated by renderPaginationControls.
    // We might not need to do anything here unless there are static elements
    // to initialize, or if we want to fetch initial results with page 1.
    // For now, initial search on form submit handles the first load.
}

/**
 * Update pagination buttons (enable/disable prev/next) - This is now handled by renderPaginationControls
 */
// function updatePaginationButtons(currentPage) { ... } // Removed


/**
 * Update search results summary
 */
function updateSearchSummary(source, destination, date, count) {
    document.getElementById('result-source').textContent = source;
    document.getElementById('result-destination').textContent = destination;
    
    if (date) {
        const dateObj = new Date(date); // Date from input is YYYY-MM-DD, safe for new Date()
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        document.getElementById('result-date').textContent = formattedDate;
    } else {
        document.getElementById('result-date').textContent = "N/A";
    }
    
    const resultCountEl = document.getElementById('result-count');
    if (typeof count === 'number') {
        resultCountEl.textContent = count;
    } else if (typeof count === 'string') { // For "..." loading state
        resultCountEl.textContent = count;
    } else {
        resultCountEl.textContent = "0";
    }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target) && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Close mobile menu when clicking a nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    // Set message and style
    toast.textContent = message;
    toast.className = `toast-notification ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add popular bus stops for autocomplete - would normally come from API
const popularStops = [
    'Siddheshwar Temple',
    'Bus Stand',
    'Railway Station',
    'Market Area',
    'Hospital',
    'College Road',
    'Industrial Area',
    'Shahu Nagar',
    'Gandhi Chowk',
    'Laxmi Nagar',
    'Shivaji Park',
    'Central Park',
    'Sports Complex',
    'Mall Road'
];

// Initialize autocomplete for search fields
document.getElementById('search-source').addEventListener('input', function() {
    showAutocomplete(this, popularStops);
});

document.getElementById('search-destination').addEventListener('input', function() {
    showAutocomplete(this, popularStops);
});

/**
 * Show autocomplete suggestions for input fields
 */
function showAutocomplete(input, suggestions) {
    const value = input.value.toLowerCase();
    
    // Clear previous autocomplete
    clearAutocomplete();
    
    if (!value) return;
    
    // Filter suggestions
    const matchedSuggestions = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(value)
    );
    
    if (matchedSuggestions.length === 0) return;
    
    // Create autocomplete dropdown
    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-list';
    
    // Add suggestions
    matchedSuggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        
        // Handle item click
        item.addEventListener('click', function() {
            input.value = suggestion;
            clearAutocomplete();
        });
        
        autocompleteList.appendChild(item);
    });
    
    // Position and append the dropdown
    const rect = input.getBoundingClientRect();
    autocompleteList.style.width = rect.width + 'px';
    autocompleteList.style.left = rect.left + window.scrollX + 'px';
    autocompleteList.style.top = rect.bottom + window.scrollY + 'px';
    
    document.body.appendChild(autocompleteList);
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function closeAutocomplete(e) {
        if (e.target !== input && !autocompleteList.contains(e.target)) {
            clearAutocomplete();
            document.removeEventListener('click', closeAutocomplete);
        }
    });
}

/**
 * Clear autocomplete dropdown
 */
function clearAutocomplete() {
    const autocompleteList = document.querySelector('.autocomplete-list');
    if (autocompleteList) {
        autocompleteList.remove();
    }
}