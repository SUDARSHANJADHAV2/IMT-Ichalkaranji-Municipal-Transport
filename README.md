# Ichalkaranji Bus Booking and Pass System (IBBPS)

## 📝 Project Overview

The Ichalkaranji Bus Booking and Pass System (IBBPS) is a full-stack web application created to improve urban mobility in Ichalkaranji. Inspired by PMPML (Pune) and KMT (Kolhapur), the system will allow citizens to view bus routes, search available buses based on source and destination, view seat pricing, book tickets, and apply for monthly bus passes. The project also includes Aadhaar-based user verification and mobile OTP confirmation to ensure secure pass issuance.

## 🎯 Objectives

*   Streamline public transport access in Ichalkaranji through a modern online platform.
*   Allow users to search and view all available buses, routes, and seat pricing.
*   Provide secure and easy booking of single-ride and monthly passes.
*   Integrate Aadhaar upload and OTP verification for secure bus pass issuance.
*   Enable the transport authority to manage all operations via an admin dashboard.

## ⚙ Key Features

### 👤 User Module

*   **User Registration/Login:** Secure account creation and access.
*   **Bus Search:** Find buses using “From [source] to [destination]” input.
*   **View Information:**
    *   Available routes.
    *   All running buses on each route.
    *   Per-seat ticket pricing.
*   **Ticket Booking:** Book single-ride tickets seamlessly.
*   **QR-Based Tickets:** Download tickets as QR codes for easy validation.
*   **Monthly Bus Pass Application:**
    *   Fill personal information (name, age, category: student/senior/etc.).
    *   Upload Aadhaar photocopy (PDF/JPG).
    *   Receive OTP on mobile for verification.
    *   Get a digital bus pass (QR or PDF).
*   **History:** View past bookings and pass history.

### 🛠 Admin Module

*   **Management:** Manage buses, routes, stops, and schedules.
*   **Pricing Control:** Manage pricing (per route or per category).
*   **Pass Application Verification:** View and verify pass applications.
*   **Analytics:** See usage reports, bookings, and analytics.

### 🗺 Optional Real-Time Tracking

*   **Live Bus Locations:** Show live or simulated bus locations on Google Maps.
*   **ETA:** Estimate arrival times at each stop.

## 🧰 Tech Stack

### 🌐 Frontend
*   **UI Framework/Library:** React.js (or HTML/CSS/JS for a simpler approach)
*   **Styling:** Tailwind CSS or Bootstrap
*   **API Communication:** Axios
*   **Mapping:** Google Maps JavaScript API
*   **Form Handling:** React Hook Form / Formik

### 🖥 Backend
*   **Framework:** Node.js + Express.js OR Django (Python-based alternative)

### 🗃 Database
*   **Type:** MongoDB (with Mongoose for schema) OR PostgreSQL/MySQL (if using Django)

### 🧩 Other Tools & APIs
*   **OTP Service:** Firebase or Twilio
*   **QR Code Generation:** qrcode (npm package)
*   **File Storage:** Cloudinary / Firebase Storage (for Aadhaar uploads)
*   **Authentication:** JSON Web Tokens (JWT)
*   **Payment Gateway (Optional):** Razorpay (sandbox)

## 🛠 Development Roadmap

1.  **Requirement Gathering:**
    *   Collect real Ichalkaranji route data.
    *   Identify fare slabs per route/category.
    *   Draft UI/UX wireframes.
2.  **Frontend Development:**
    *   User login/signup forms.
    *   Route/bus search with “From–To” interface.
    *   Bus details + pricing display.
    *   Booking and pass application forms.
    *   Aadhaar upload + OTP verification form.
    *   Responsive design for mobile and desktop.
3.  **Backend API Development:**
    *   User Auth, Booking APIs, Bus Info API.
    *   Admin CRUD for buses/routes/stops.
    *   Aadhaar file upload + OTP service integration.
    *   Pass application submission and verification APIs.
4.  **Admin Dashboard:**
    *   Dashboard to view routes, buses, bookings, and pass applications.
    *   Approve/reject pass applications.
    *   Export data and generate reports.
5.  **Real-Time Bus Tracking (Optional):**
    *   Simulated or real GPS location shown on maps.
    *   ETA per stop.
6.  **Testing & Deployment:**
    *   Test booking, route search, pass flow.
    *   **Deployment:**
        *   Frontend: Netlify / Vercel
        *   Backend: Render / Railway / Heroku
        *   Database: MongoDB Atlas / ElephantSQL
