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

/**
 * Initialize the search form submission
 */
function initSearchForm() {
    const searchForm = document.getElementById('search-form');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const source = document.getElementById('search-source').value;
        const destination = document.getElementById('search-destination').value;
        const date = document.getElementById('search-date').value;
        
        // Validate form inputs
        if (!source || !destination || !date) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // In a real application, we would make an API call here
        // For demo purposes, we'll just show the existing results
        document.getElementById('search-results').style.display = 'flex';
        
        // Update search results summary with the new search criteria
        updateSearchSummary(source, destination, date);
        
        // Scroll to results
        document.getElementById('search-results').scrollIntoView({
            behavior: 'smooth'
        });
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
        // Get filter values
        const departureFilters = getCheckedValues('departure');
        const busTypeFilters = getCheckedValues('busType');
        const priceFilter = document.getElementById('price-range').value;
        
        // In a real application, we would filter the results based on these values
        // For demo purposes, we'll just show a toast
        const filterSummary = [];
        
        if (departureFilters.length) filterSummary.push(`${departureFilters.length} departure times`);
        if (busTypeFilters.length) filterSummary.push(`${busTypeFilters.length} bus types`);
        filterSummary.push(`Max price: ₹${priceFilter}`);
        
        showToast(`Filters applied: ${filterSummary.join(', ')}`, 'success');
        
        // Filter the bus items (demo)
        filterBusItems(departureFilters, busTypeFilters, priceFilter);
    });
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    resetFiltersBtn.addEventListener('click', function() {
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price range
        const priceRange = document.getElementById('price-range');
        priceRange.value = 100;
        maxPrice.textContent = `₹${priceRange.value}`;
        
        // Reset filters (show all buses)
        resetFilters();
        
        showToast('Filters reset', 'info');
    });
}

/**
 * Get checked values for a given name
 */
function getCheckedValues(name) {
    const checked = [];
    document.querySelectorAll(`input[name="${name}"]:checked`).forEach(checkbox => {
        checked.push(checkbox.value);
    });
    return checked;
}

/**
 * Demo function to filter bus items
 */
function filterBusItems(departureFilters, busTypeFilters, maxPrice) {
    const busItems = document.querySelectorAll('.bus-item');
    let visibleCount = 0;
    
    busItems.forEach(item => {
        // For demo purposes, we'll implement simple filtering
        
        // Check bus type
        const busType = item.querySelector('.bus-type').classList[1]; // ordinary, express, ac
        const busTypeMatch = busTypeFilters.length === 0 || busTypeFilters.includes(busType);
        
        // Check price
        const price = parseInt(item.querySelector('.fare').textContent.replace('₹', ''));
        const priceMatch = price <= maxPrice;
        
        // Check departure time (simplified for demo)
        const departureTime = item.querySelector('.departure .time').textContent;
        const hour = parseInt(departureTime.split(':')[0]);
        const isPM = departureTime.includes('PM');
        const adjustedHour = isPM && hour !== 12 ? hour + 12 : hour;
        
        let departureTimeMatch = true;
        if (departureFilters.length > 0) {
            departureTimeMatch = false;
            
            if (departureFilters.includes('morning') && adjustedHour >= 6 && adjustedHour < 12) {
                departureTimeMatch = true;
            }
            
            if (departureFilters.includes('afternoon') && adjustedHour >= 12 && adjustedHour < 16) {
                departureTimeMatch = true;
            }
            
            if (departureFilters.includes('evening') && adjustedHour >= 16 && adjustedHour < 20) {
                departureTimeMatch = true;
            }
            
            if (departureFilters.includes('night') && (adjustedHour >= 20 || adjustedHour < 6)) {
                departureTimeMatch = true;
            }
        }
        
        // Show or hide based on filters
        if (busTypeMatch && priceMatch && departureTimeMatch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update result count
    document.getElementById('result-count').textContent = visibleCount;
    
    // Handle no results
    if (visibleCount === 0) {
        showNoResults();
    } else {
        hideNoResults();
    }
}

/**
 * Show no results message
 */
function showNoResults() {
    // Check if the message already exists
    if (!document.querySelector('.no-results-message')) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No buses found</h3>
                <p>Try adjusting your filters or search criteria</p>
            </div>
        `;
        
        document.querySelector('.bus-list').appendChild(message);
    }
}

/**
 * Hide no results message
 */
function hideNoResults() {
    const message = document.querySelector('.no-results-message');
    if (message) {
        message.remove();
    }
}

/**
 * Reset filters and show all buses
 */
function resetFilters() {
    const busItems = document.querySelectorAll('.bus-item');
    
    busItems.forEach(item => {
        item.style.display = 'block';
    });
    
    // Update result count
    document.getElementById('result-count').textContent = busItems.length;
    
    // Hide no results message if it exists
    hideNoResults();
}

/**
 * Initialize sorting functionality
 */
function initSorting() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            sortButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get sort type
            const sortType = this.getAttribute('data-sort');
            
            // Sort the bus items
            sortBusItems(sortType);
        });
    });
}

/**
 * Sort bus items by the given sort type
 */
function sortBusItems(sortType) {
    const busList = document.querySelector('.bus-list');
    const busItems = Array.from(busList.querySelectorAll('.bus-item'));
    
    // Sort based on type
    busItems.sort((a, b) => {
        if (sortType === 'departure') {
            // Sort by departure time
            const timeA = a.querySelector('.departure .time').textContent;
            const timeB = b.querySelector('.departure .time').textContent;
            
            // Convert to comparable format (simplified)
            return convertTimeToMinutes(timeA) - convertTimeToMinutes(timeB);
        } else if (sortType === 'duration') {
            // Sort by duration
            const durationA = a.querySelector('.duration-time').textContent;
            const durationB = b.querySelector('.duration-time').textContent;
            
            // Extract minutes
            const minutesA = parseInt(durationA.match(/\d+/)[0]);
            const minutesB = parseInt(durationB.match(/\d+/)[0]);
            
            return minutesA - minutesB;
        } else if (sortType === 'price') {
            // Sort by price
            const priceA = parseInt(a.querySelector('.fare').textContent.replace('₹', ''));
            const priceB = parseInt(b.querySelector('.fare').textContent.replace('₹', ''));
            
            return priceA - priceB;
        }
        
        return 0;
    });
    
    // Clear the bus list
    busList.innerHTML = '';
    
    // Append sorted items
    busItems.forEach(item => {
        busList.appendChild(item);
    });
    
    // Show toast to indicate sorting
    showToast(`Sorted by ${sortType}`, 'info');
}

/**
 * Convert time string (e.g., "07:30 AM") to minutes for comparison
 */
function convertTimeToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + minutes;
}

/**
 * Initialize pagination
 */
function initPagination() {
    const pageNumbers = document.querySelectorAll('.page-number');
    const prevButton = document.querySelector('.prev-page');
    const nextButton = document.querySelector('.next-page');
    
    // Page number clicks
    pageNumbers.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            pageNumbers.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get page number
            const pageNumber = parseInt(this.textContent);
            
            // Update prev/next button states
            updatePaginationButtons(pageNumber);
            
            // In a real app, this would fetch the next page of results
            showToast(`Navigated to page ${pageNumber}`, 'info');
        });
    });
    
    // Previous page button
    prevButton.addEventListener('click', function() {
        if (this.disabled) return;
        
        // Find active page
        const activePage = document.querySelector('.page-number.active');
        const pageNumber = parseInt(activePage.textContent);
        
        if (pageNumber > 1) {
            // Activate previous page
            const prevPage = document.querySelector(`.page-number:nth-child(${pageNumber - 1})`);
            if (prevPage) {
                prevPage.click();
            }
        }
    });
    
    // Next page button
    nextButton.addEventListener('click', function() {
        if (this.disabled) return;
        
        // Find active page
        const activePage = document.querySelector('.page-number.active');
        const pageNumber = parseInt(activePage.textContent);
        const totalPages = document.querySelectorAll('.page-number').length;
        
        if (pageNumber < totalPages) {
            // Activate next page
            const nextPage = document.querySelector(`.page-number:nth-child(${pageNumber + 1})`);
            if (nextPage) {
                nextPage.click();
            }
        }
    });
}

/**
 * Update pagination buttons (enable/disable prev/next)
 */
function updatePaginationButtons(currentPage) {
    const totalPages = document.querySelectorAll('.page-number').length;
    const prevButton = document.querySelector('.prev-page');
    const nextButton = document.querySelector('.next-page');
    
    // Disable/enable previous button
    prevButton.disabled = currentPage === 1;
    
    // Disable/enable next button
    nextButton.disabled = currentPage === totalPages;
    
    // Add/remove disabled class for styling
    if (prevButton.disabled) {
        prevButton.classList.add('disabled');
    } else {
        prevButton.classList.remove('disabled');
    }
    
    if (nextButton.disabled) {
        nextButton.classList.add('disabled');
    } else {
        nextButton.classList.remove('disabled');
    }
}

/**
 * Update search results summary
 */
function updateSearchSummary(source = 'Siddheshwar Temple', destination = 'Bus Stand', date = null) {
    document.getElementById('result-source').textContent = source;
    document.getElementById('result-destination').textContent = destination;
    
    if (date) {
        // Format date as "DD MMM, YYYY"
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        document.getElementById('result-date').textContent = formattedDate;
    }
    
    // Update result count (this would normally come from API)
    const visibleBuses = document.querySelectorAll('.bus-item:not([style*="display: none"])');
    document.getElementById('result-count').textContent = visibleBuses.length;
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