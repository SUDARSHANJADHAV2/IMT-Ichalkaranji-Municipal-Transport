/**
 * IBBPS - Ichalkaranji Bus Booking and Pass System
 * booking.js - Handles all booking related functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the bus-details page or booking page
  const isBusDetailsPage = document.querySelector('.bus-details-section') !== null;
  const isBookingPage = document.querySelector('.booking-page') !== null;

  // Common seat selection variables
  let selectedSeats = [];
  const seatPrice = 15; // Default price per seat
  
  // Handle bus details page functionality
  if (isBusDetailsPage) {
      initBusDetailsPage();
  }
  
  // Handle booking page functionality
  if (isBookingPage) {
      initBookingPage();
  }

  /**
   * Initialize Bus Details Page functionality
   */
  function initBusDetailsPage() {
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabPanes = document.querySelectorAll('.tab-pane');
      const availableSeats = document.querySelectorAll('.seat.available');
      const selectedSeatsElement = document.getElementById('selected-seats');
      const totalFareElement = document.getElementById('total-fare');
      const proceedToPayButton = document.getElementById('proceed-to-pay');
      const reviewStars = document.querySelectorAll('.rating-input .fa-star');
      
      // Tab switching functionality
      tabButtons.forEach(button => {
          button.addEventListener('click', () => {
              const tabId = button.getAttribute('data-tab');
              
              // Remove active class from all buttons and panes
              tabButtons.forEach(btn => btn.classList.remove('active'));
              tabPanes.forEach(pane => pane.classList.remove('active'));
              
              // Add active class to current button and pane
              button.classList.add('active');
              document.getElementById(tabId).classList.add('active');
          });
      });
      
      // Seat selection functionality
      availableSeats.forEach(seat => {
          seat.addEventListener('click', () => {
              const seatNumber = seat.getAttribute('data-seat');
              
              if (seat.classList.contains('selected')) {
                  // Deselect seat
                  seat.classList.remove('selected');
                  selectedSeats = selectedSeats.filter(s => s !== seatNumber);
              } else {
                  // Select seat
                  seat.classList.add('selected');
                  selectedSeats.push(seatNumber);
              }
              
              // Update selected seats display
              if (selectedSeats.length === 0) {
                  selectedSeatsElement.textContent = 'None';
                  proceedToPayButton.disabled = true;
              } else {
                  selectedSeatsElement.textContent = selectedSeats.join(', ');
                  proceedToPayButton.disabled = false;
              }
              
              // Update total fare
              const totalFare = selectedSeats.length * seatPrice;
              totalFareElement.textContent = `₹${totalFare}`;
          });
      });
      
      // Rating functionality for review form
      reviewStars.forEach(star => {
          star.addEventListener('click', () => {
              const rating = parseInt(star.getAttribute('data-rating'));
              
              // Reset all stars
              reviewStars.forEach(s => s.classList.remove('fas'));
              reviewStars.forEach(s => s.classList.add('far'));
              
              // Fill stars up to the selected rating
              for (let i = 0; i < rating; i++) {
                  reviewStars[i].classList.remove('far');
                  reviewStars[i].classList.add('fas');
              }
          });
          
          // Hover effect for stars
          star.addEventListener('mouseover', () => {
              const rating = parseInt(star.getAttribute('data-rating'));
              
              for (let i = 0; i < rating; i++) {
                  reviewStars[i].classList.add('hover');
              }
          });
          
          star.addEventListener('mouseout', () => {
              reviewStars.forEach(s => s.classList.remove('hover'));
          });
      });
      
      // Handle proceed to pay button
      proceedToPayButton.addEventListener('click', () => {
          // Save selected seats to session storage for the booking page
          sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
          sessionStorage.setItem('totalFare', selectedSeats.length * seatPrice);
          sessionStorage.setItem('busName', 'Express Route 101');
          sessionStorage.setItem('journeyDate', '16 Apr, 2025');
          sessionStorage.setItem('departureTime', '07:30 AM');
          sessionStorage.setItem('departureLocation', 'Siddheshwar Temple');
          sessionStorage.setItem('arrivalTime', '08:00 AM');
          sessionStorage.setItem('arrivalLocation', 'Bus Stand');
          
          // Redirect to booking page
          window.location.href = 'booking.html';
      });
      
      // Submit review form
      const reviewForm = document.querySelector('.review-form');
      if (reviewForm) {
          reviewForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const reviewText = document.getElementById('review-text').value;
              
              // Check if a rating was selected
              let selectedRating = 0;
              reviewStars.forEach(star => {
                  if (star.classList.contains('fas')) {
                      selectedRating = Math.max(selectedRating, parseInt(star.getAttribute('data-rating')));
                  }
              });
              
              if (selectedRating === 0) {
                  alert('Please select a rating');
                  return;
              }
              
              if (reviewText.trim() === '') {
                  alert('Please enter your review');
                  return;
              }
              
              // Mock submission - in a real app, this would post to a server
              alert('Thank you for your review!');
              reviewForm.reset();
              
              // Reset stars
              reviewStars.forEach(s => {
                  s.classList.remove('fas');
                  s.classList.add('far');
              });
          });
      }
      
      // Handle view more reviews button
      const viewMoreButton = document.querySelector('.view-more-reviews button');
      if (viewMoreButton) {
          viewMoreButton.addEventListener('click', () => {
              // In a real app, this would load more reviews
              alert('Loading more reviews...');
          });
      }
  }

  /**
   * Initialize Booking Page functionality
   */
  function initBookingPage() {
      // Get elements from booking page
      const seatCountInput = document.getElementById('seat-count');
      const decreaseSeatsBtn = document.getElementById('decrease-seats');
      const increaseSeatsBtn = document.getElementById('increase-seats');
      const seatsContainer = document.querySelector('.seats-container');
      const summarySeatsElement = document.getElementById('summary-seats');
      const baseFareElement = document.getElementById('base-fare');
      const serviceFeeElement = document.getElementById('service-fee');
      const totalFareElement = document.getElementById('total-fare');
      const bookingForm = document.getElementById('booking-form');
      
      // Get bus info from session storage or use defaults
      const busNumber = document.getElementById('bus-number');
      const departureTime = document.getElementById('departure-time');
      const sourceStation = document.getElementById('source-station');
      const arrivalTime = document.getElementById('arrival-time');
      const destinationStation = document.getElementById('destination-station');
      const journeyDate = document.getElementById('journey-date');
      const availableSeats = document.getElementById('available-seats');
      const fareDisplay = document.getElementById('fare');
      
      // Fill bus info from session storage if available
      if (sessionStorage.getItem('busName')) {
          busNumber.textContent = sessionStorage.getItem('busName');
      }
      if (sessionStorage.getItem('departureTime')) {
          departureTime.textContent = sessionStorage.getItem('departureTime');
      }
      if (sessionStorage.getItem('departureLocation')) {
          sourceStation.textContent = sessionStorage.getItem('departureLocation');
      }
      if (sessionStorage.getItem('arrivalTime')) {
          arrivalTime.textContent = sessionStorage.getItem('arrivalTime');
      }
      if (sessionStorage.getItem('arrivalLocation')) {
          destinationStation.textContent = sessionStorage.getItem('arrivalLocation');
      }
      if (sessionStorage.getItem('journeyDate')) {
          journeyDate.textContent = sessionStorage.getItem('journeyDate');
      }
      
      // Setup seat selection
      generateSeats();
      
      // Handle seat counter buttons
      decreaseSeatsBtn.addEventListener('click', () => {
          let currentValue = parseInt(seatCountInput.value);
          if (currentValue > 1) {
              seatCountInput.value = currentValue - 1;
              updateSeatCount();
          }
      });
      
      increaseSeatsBtn.addEventListener('click', () => {
          let currentValue = parseInt(seatCountInput.value);
          if (currentValue < 6) {
              seatCountInput.value = currentValue + 1;
              updateSeatCount();
          }
      });
      
      // Update fare when seat count changes
      function updateSeatCount() {
          const seatCount = parseInt(seatCountInput.value);
          summarySeatsElement.textContent = seatCount;
          
          // Calculate fares
          const baseFare = seatCount * 25;
          const serviceFee = seatCount * 2;
          const totalFare = baseFare + serviceFee;
          
          // Update display
          baseFareElement.textContent = `₹${baseFare}`;
          serviceFeeElement.textContent = `₹${serviceFee}`;
          totalFareElement.textContent = `₹${totalFare}`;
          
          // Reset selected seats when count changes
          selectedSeats = [];
          document.querySelectorAll('.seat.selected').forEach(seat => {
              seat.classList.remove('selected');
          });
      }
      
      // Generate seats for the bus layout
      function generateSeats() {
          // Clear existing seats
          seatsContainer.innerHTML = '';
          
          // Create a mock seat layout
          const totalRows = 8;
          const seatsPerRow = 4;
          const layout = [];
          
          // Generate random unavailable seats
          const unavailableSeats = [];
          for (let i = 0; i < 10; i++) {
              const row = Math.floor(Math.random() * totalRows) + 1;
              const col = Math.floor(Math.random() * seatsPerRow) + 1;
              unavailableSeats.push(`${String.fromCharCode(64 + row)}${col}`);
          }
          
          // Create rows
          for (let row = 1; row <= totalRows; row++) {
              const rowElement = document.createElement('div');
              rowElement.className = 'seat-row';
              
              // Create seats in the row
              for (let col = 1; col <= seatsPerRow; col++) {
                  // Add aisle in the middle
                  if (col === 3) {
                      const aisleElement = document.createElement('div');
                      aisleElement.className = 'seat-aisle';
                      rowElement.appendChild(aisleElement);
                  }
                  
                  const seatElement = document.createElement('div');
                  const seatId = `${String.fromCharCode(64 + row)}${col}`;
                  seatElement.className = unavailableSeats.includes(seatId) ? 'seat booked' : 'seat available';
                  seatElement.setAttribute('data-seat', seatId);
                  seatElement.textContent = seatId;
                  
                  // Add click event for available seats
                  if (!unavailableSeats.includes(seatId)) {
                      seatElement.addEventListener('click', () => {
                          const maxSeats = parseInt(seatCountInput.value);
                          const currentSelected = document.querySelectorAll('.seat.selected').length;
                          
                          if (seatElement.classList.contains('selected')) {
                              // Deselect seat
                              seatElement.classList.remove('selected');
                              selectedSeats = selectedSeats.filter(s => s !== seatId);
                          } else if (currentSelected < maxSeats) {
                              // Select seat if we haven't reached the max
                              seatElement.classList.add('selected');
                              selectedSeats.push(seatId);
                          } else {
                              alert(`You can only select ${maxSeats} seats. Please deselect a seat first.`);
                          }
                      });
                  }
                  
                  rowElement.appendChild(seatElement);
              }
              
              seatsContainer.appendChild(rowElement);
          }
      }
      
      // Handle form submission
      bookingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Validate selected seats
          const requiredSeats = parseInt(seatCountInput.value);
          const selectedSeatsCount = document.querySelectorAll('.seat.selected').length;
          
          if (selectedSeatsCount < requiredSeats) {
              alert(`Please select ${requiredSeats} seats.`);
              return;
          }
          
          // Get form data
          const formData = {
              name: document.getElementById('passenger-name').value,
              mobile: document.getElementById('passenger-mobile').value,
              email: document.getElementById('passenger-email').value,
              seatCount: requiredSeats,
              selectedSeats: selectedSeats,
              totalFare: parseInt(totalFareElement.textContent.replace('₹', ''))
          };
          
          // In a real application, this would make an API call to create a booking
          console.log('Booking data:', formData);
          
          // Save booking to localStorage for demo purposes
          const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          const bookingId = 'BK' + Math.floor(Math.random() * 1000000);
          
          const booking = {
              id: bookingId,
              ...formData,
              bus: busNumber.textContent,
              date: journeyDate.textContent,
              source: sourceStation.textContent,
              destination: destinationStation.textContent,
              departureTime: departureTime.textContent,
              arrivalTime: arrivalTime.textContent,
              status: 'Confirmed',
              createdAt: new Date().toISOString()
          };
          
          bookings.push(booking);
          localStorage.setItem('bookings', JSON.stringify(bookings));
          
          // Show confirmation message
          alert(`Booking Successful! Your booking ID is ${bookingId}`);
          
          // In a real application, this would redirect to a payment gateway or confirmation page
          setTimeout(() => {
              window.location.href = 'dashboard.html';
          }, 1000);
      });
      
      // Initialize with default values
      updateSeatCount();
      
      // Pre-fill form if user is logged in
      const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
      if (loggedInUser) {
          document.getElementById('passenger-name').value = loggedInUser.name || '';
          document.getElementById('passenger-email').value = loggedInUser.email || '';
          document.getElementById('passenger-mobile').value = loggedInUser.mobile || '';
      }
  }
});