/**
 * IBBPS - Ichalkaranji Bus Booking and Pass System
 * maps.js - Handles all map and real-time tracking functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the track page
    const isTrackPage = document.querySelector('.track-section') !== null;
    
    if (isTrackPage) {
        initTrackingPage();
    }

    /**
     * Initialize the tracking page functionality
     */
    function initTrackingPage() {
        // Map elements
        const mapElement = document.getElementById('map');
        const routeSelector = document.getElementById('route-selector');
        const trackBusBtn = document.getElementById('track-bus-btn');
        const refreshMapBtn = document.getElementById('refresh-map');
        const recenterMapBtn = document.getElementById('recenter-map');
        
        // Bus info elements
        const busDetails = document.getElementById('bus-details');
        const routeInfo = busDetails.querySelector('.route-info');
        const infoPlaceholder = busDetails.querySelector('.info-placeholder');
        const stopsList = document.getElementById('stops-list');
        const routeStops = document.getElementById('route-stops');
        
        // Map variables
        let map;
        let busMarker;
        let routePath;
        let routeBounds;
        let selectedRoute = null;
        let busUpdateInterval;
        
        // Route data - in a real app, this would come from an API
        const routes = {
            'route-101': {
                name: 'Express Route 101',
                description: 'Siddheshwar Temple to Bus Stand',
                status: 'On Time',
                color: '#1E88E5',
                stops: [
                    { name: 'Siddheshwar Temple', lat: 16.7002, lng: 74.4700, time: '07:30 AM', status: 'departed' },
                    { name: 'Market Area', lat: 16.7052, lng: 74.4670, time: '07:42 AM', status: 'next' },
                    { name: 'Hospital', lat: 16.7102, lng: 74.4640, time: '07:50 AM', status: 'upcoming' },
                    { name: 'Bus Stand', lat: 16.7152, lng: 74.4610, time: '08:00 AM', status: 'upcoming' }
                ],
                path: [
                    { lat: 16.7002, lng: 74.4700 },
                    { lat: 16.7020, lng: 74.4690 },
                    { lat: 16.7040, lng: 74.4680 },
                    { lat: 16.7052, lng: 74.4670 },
                    { lat: 16.7070, lng: 74.4660 },
                    { lat: 16.7090, lng: 74.4650 },
                    { lat: 16.7102, lng: 74.4640 },
                    { lat: 16.7130, lng: 74.4630 },
                    { lat: 16.7140, lng: 74.4620 },
                    { lat: 16.7152, lng: 74.4610 }
                ],
                currentPosition: { lat: 16.7030, lng: 74.4685 } // Simulated current position
            },
            'route-102': {
                name: 'City Route 102',
                description: 'Railway Station to City Hospital',
                status: 'Delayed by 5 min',
                color: '#43A047',
                stops: [
                    { name: 'Railway Station', lat: 16.7200, lng: 74.4800, time: '08:00 AM', status: 'departed' },
                    { name: 'City Center', lat: 16.7170, lng: 74.4770, time: '08:15 AM', status: 'departed' },
                    { name: 'College Road', lat: 16.7140, lng: 74.4740, time: '08:25 AM', status: 'next' },
                    { name: 'City Hospital', lat: 16.7110, lng: 74.4710, time: '08:40 AM', status: 'upcoming' }
                ],
                path: [
                    { lat: 16.7200, lng: 74.4800 },
                    { lat: 16.7190, lng: 74.4790 },
                    { lat: 16.7180, lng: 74.4780 },
                    { lat: 16.7170, lng: 74.4770 },
                    { lat: 16.7160, lng: 74.4760 },
                    { lat: 16.7150, lng: 74.4750 },
                    { lat: 16.7140, lng: 74.4740 },
                    { lat: 16.7130, lng: 74.4730 },
                    { lat: 16.7120, lng: 74.4720 },
                    { lat: 16.7110, lng: 74.4710 }
                ],
                currentPosition: { lat: 16.7160, lng: 74.4760 } // Simulated current position
            },
            'route-103': {
                name: 'Shuttle Route 103',
                description: 'Bus Stand to Industrial Area',
                status: 'On Time',
                color: '#FB8C00',
                stops: [
                    { name: 'Bus Stand', lat: 16.7152, lng: 74.4610, time: '07:00 AM', status: 'departed' },
                    { name: 'Market', lat: 16.7122, lng: 74.4580, time: '07:10 AM', status: 'departed' },
                    { name: 'College', lat: 16.7092, lng: 74.4550, time: '07:20 AM', status: 'departed' },
                    { name: 'Industrial Area', lat: 16.7062, lng: 74.4520, time: '07:30 AM', status: 'next' }
                ],
                path: [
                    { lat: 16.7152, lng: 74.4610 },
                    { lat: 16.7142, lng: 74.4600 },
                    { lat: 16.7132, lng: 74.4590 },
                    { lat: 16.7122, lng: 74.4580 },
                    { lat: 16.7112, lng: 74.4570 },
                    { lat: 16.7102, lng: 74.4560 },
                    { lat: 16.7092, lng: 74.4550 },
                    { lat: 16.7082, lng: 74.4540 },
                    { lat: 16.7072, lng: 74.4530 },
                    { lat: 16.7062, lng: 74.4520 }
                ],
                currentPosition: { lat: 16.7082, lng: 74.4540 } // Simulated current position
            },
            'route-104': {
                name: 'Market Route 104',
                description: 'Main Market to Residential Area',
                status: 'Delayed by 10 min',
                color: '#D81B60',
                stops: [
                    { name: 'Main Market', lat: 16.7050, lng: 74.4850, time: '09:00 AM', status: 'departed' },
                    { name: 'School', lat: 16.7020, lng: 74.4880, time: '09:10 AM', status: 'next' },
                    { name: 'Park', lat: 16.6990, lng: 74.4910, time: '09:20 AM', status: 'upcoming' },
                    { name: 'Residential Area', lat: 16.6960, lng: 74.4940, time: '09:30 AM', status: 'upcoming' }
                ],
                path: [
                    { lat: 16.7050, lng: 74.4850 },
                    { lat: 16.7040, lng: 74.4860 },
                    { lat: 16.7030, lng: 74.4870 },
                    { lat: 16.7020, lng: 74.4880 },
                    { lat: 16.7010, lng: 74.4890 },
                    { lat: 16.7000, lng: 74.4900 },
                    { lat: 16.6990, lng: 74.4910 },
                    { lat: 16.6980, lng: 74.4920 },
                    { lat: 16.6970, lng: 74.4930 },
                    { lat: 16.6960, lng: 74.4940 }
                ],
                currentPosition: { lat: 16.7030, lng: 74.4870 } // Simulated current position
            }
        };
        
        // Initialize map
        function initMap() {
            // Set default location to Ichalkaranji city center
            const defaultLocation = { lat: 16.7050, lng: 74.4700 };
            
            // Map options
            const mapOptions = {
                center: defaultLocation,
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                styles: [
                    {
                        "featureType": "transit.station.bus",
                        "stylers": [
                            { "visibility": "on" },
                            { "weight": 2.0 }
                        ]
                    }
                ]
            };
            
            // Create map
            map = new google.maps.Map(mapElement, mapOptions);
            
            // Check if geolocation is available
            if (navigator.geolocation) {
                // Get user's location
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        // Create marker for user location
                        new google.maps.Marker({
                            position: userLocation,
                            map: map,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: "#4285F4",
                                fillOpacity: 0.7,
                                strokeColor: "#FFFFFF",
                                strokeWeight: 2
                            },
                            title: "Your Location"
                        });
                        
                        // Center map on user
                        map.setCenter(userLocation);
                    },
                    (error) => {
                        console.log("Error getting location: ", error);
                    }
                );
            }
        }
        
        // Track bus on the selected route
        function trackBus() {
            // Get selected route
            const routeId = routeSelector.value;
            
            if (!routeId) {
                alert("Please select a route to track.");
                return;
            }
            
            selectedRoute = routeId;
            const route = routes[routeId];
            
            // Update bus info panel
            document.getElementById('bus-id').textContent = route.name;
            document.getElementById('route-name').textContent = route.description;
            document.getElementById('bus-status').textContent = route.status;
            
            // Show route info and hide placeholder
            infoPlaceholder.classList.add('hidden');
            routeInfo.classList.remove('hidden');
            stopsList.classList.remove('hidden');
            
            // Clear previous route stops
            routeStops.innerHTML = '';
            
            // Add stops to list
            route.stops.forEach((stop, index) => {
                const li = document.createElement('li');
                li.className = `stop-item ${stop.status}`;
                
                const statusIcon = document.createElement('span');
                statusIcon.className = 'stop-status';
                
                const statusText = document.createElement('span');
                statusText.className = 'status-text';
                
                switch (stop.status) {
                    case 'departed':
                        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                        statusText.textContent = 'Departed';
                        break;
                    case 'next':
                        statusIcon.innerHTML = '<i class="fas fa-dot-circle"></i>';
                        statusText.textContent = 'Arriving';
                        break;
                    case 'upcoming':
                        statusIcon.innerHTML = '<i class="far fa-circle"></i>';
                        statusText.textContent = 'Upcoming';
                        break;
                }
                
                li.innerHTML = `
                    <div class="stop-info">
                        <div class="stop-name">${stop.name}</div>
                        <div class="stop-time">${stop.time}</div>
                    </div>
                `;
                
                li.prepend(statusIcon);
                li.querySelector('.stop-info').appendChild(statusText);
                routeStops.appendChild(li);
            });
            
            // Clear previous map elements
            if (busMarker) busMarker.setMap(null);
            if (routePath) routePath.setMap(null);
            
            // Create route path
            routePath = new google.maps.Polyline({
                path: route.path,
                geodesic: true,
                strokeColor: route.color,
                strokeOpacity: 0.7,
                strokeWeight: 5
            });
            
            // Add route path to map
            routePath.setMap(map);
            
            // Create bus marker
            busMarker = new google.maps.Marker({
                position: route.currentPosition,
                map: map,
                icon: {
                    url: 'assets/images/bus-icon.svg',
                    scaledSize: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(16, 16)
                },
                title: route.name
            });
            
            // Create bounds for the route
            routeBounds = new google.maps.LatLngBounds();
            
            // Add all path points to bounds
            route.path.forEach(point => {
                routeBounds.extend(point);
            });
            
            // Fit map to route bounds
            map.fitBounds(routeBounds);
            
            // Start bus movement simulation
            startBusSimulation(routeId);
        }
        
        // Simulate bus movement along the route
        function startBusSimulation(routeId) {
            // Clear any existing interval
            if (busUpdateInterval) {
                clearInterval(busUpdateInterval);
            }
            
            const route = routes[routeId];
            let pathIndex = route.path.findIndex(point => 
                point.lat === route.currentPosition.lat && 
                point.lng === route.currentPosition.lng
            );
            
            if (pathIndex === -1) {
                // If current position not found in path, start from beginning
                pathIndex = 0;
            }
            
            // Update bus position every 3 seconds
            busUpdateInterval = setInterval(() => {
                // Move to next point in path
                pathIndex = (pathIndex + 1) % route.path.length;
                
                // Update current position
                route.currentPosition = route.path[pathIndex];
                
                // Update marker position with animation
                busMarker.setPosition(route.currentPosition);
                
                // Update next stop status if we've reached it
                route.stops.forEach((stop, index) => {
                    // Check if bus is at a stop point (approximate)
                    const isAtStop = Math.abs(route.currentPosition.lat - stop.lat) < 0.0005 && 
                                    Math.abs(route.currentPosition.lng - stop.lng) < 0.0005;
                    
                    if (isAtStop && stop.status === 'next') {
                        // Update stop status
                        stop.status = 'departed';
                        
                        // Update next stop
                        if (index < route.stops.length - 1) {
                            route.stops[index + 1].status = 'next';
                        }
                        
                        // Update stops list
                        updateStopsList(route);
                    }
                });
            }, 3000);
        }
        
        // Update the stops list with current status
        function updateStopsList(route) {
            // Clear previous route stops
            routeStops.innerHTML = '';
            
            // Add updated stops to list
            route.stops.forEach((stop, index) => {
                const li = document.createElement('li');
                li.className = `stop-item ${stop.status}`;
                
                const statusIcon = document.createElement('span');
                statusIcon.className = 'stop-status';
                
                const statusText = document.createElement('span');
                statusText.className = 'status-text';
                
                switch (stop.status) {
                    case 'departed':
                        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                        statusText.textContent = 'Departed';
                        break;
                    case 'next':
                        statusIcon.innerHTML = '<i class="fas fa-dot-circle"></i>';
                        statusText.textContent = 'Arriving';
                        break;
                    case 'upcoming':
                        statusIcon.innerHTML = '<i class="far fa-circle"></i>';
                        statusText.textContent = 'Upcoming';
                        break;
                }
                
                li.innerHTML = `
                    <div class="stop-info">
                        <div class="stop-name">${stop.name}</div>
                        <div class="stop-time">${stop.time}</div>
                    </div>
                `;
                
                li.prepend(statusIcon);
                li.querySelector('.stop-info').appendChild(statusText);
                routeStops.appendChild(li);
            });
        }
        
        // Event listeners
        trackBusBtn.addEventListener('click', trackBus);
        
        refreshMapBtn.addEventListener('click', () => {
            if (selectedRoute) {
                trackBus();
            } else {
                alert("Please select a route first.");
            }
        });
        
        recenterMapBtn.addEventListener('click', () => {
            if (routeBounds) {
                map.fitBounds(routeBounds);
            } else if (map) {
                // Default to Ichalkaranji city center
                map.setCenter({ lat: 16.7050, lng: 74.4700 });
                map.setZoom(14);
            }
        });
        
        // Initialize map when page loads
        // Check if Google Maps API is loaded
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            initMap();
        } else {
            // Add event listener for when the API loads
            window.initMap = initMap;
        }
    }
});