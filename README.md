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

## 🚀 Getting Started: Setup and Installation

This section provides a general guide to get the IBBPS project up and running on your local machine for development and testing purposes.

**Prerequisites:**

*   Node.js (which includes npm or yarn) for frontend and Node.js backend.
*   Python and pip (if using Django backend).
*   MongoDB or PostgreSQL/MySQL installed and running (depending on backend choice).
*   Git for version control.
*   A code editor (e.g., VS Code).
*   Accounts for third-party services (Firebase/Twilio, Cloudinary, Razorpay - sandbox for testing).

**1. Clone the Repository (Hypothetical)**

Since the code is not yet available, this step is for future reference.
```bash
git clone <repository-url>
cd ichalkaranji-bus-booking-system
```

**2. Frontend Setup**

Assuming React.js and Node.js environment:

*   **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
*   **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```
*   **Environment Variables:**
    Create a `.env` file in the `frontend` directory. Add necessary environment variables, such as:
    ```env
    REACT_APP_API_BASE_URL=http://localhost:5000/api # Example backend URL
    REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    REACT_APP_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID # Optional
    ```
    *(Note: Actual variable names may vary based on implementation.)*

**3. Backend Setup**

**Option A: Node.js + Express.js Backend**

*   **Navigate to the backend directory:**
    ```bash
    cd backend # (Or your backend folder name)
    ```
*   **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```
*   **Environment Variables:**
    Create a `.env` file in the `backend` directory. Add necessary environment variables:
    ```env
    PORT=5000 # Or any port you prefer
    MONGODB_URI=your_mongodb_connection_string # If using MongoDB
    JWT_SECRET=your_jwt_secret_key
    TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID # If using Twilio
    TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
    TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
    # OR FIREBASE Admin SDK configuration (e.g., path to service account key)
    # CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
    # CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
    # CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
    ```
    *(Note: Actual variable names may vary based on implementation.)*

**Option B: Django Backend**

*   **Navigate to the backend directory:**
    ```bash
    cd backend # (Or your backend folder name)
    ```
*   **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate # On Windows: venv\Scripts\activate
    ```
*   **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(You would need to create a `requirements.txt` file listing Django, Django REST framework, psycopg2-binary (for PostgreSQL), mysqlclient (for MySQL), etc.)*
*   **Environment Variables:**
    Django typically uses a `settings.py` file. You might use a `.env` file with a library like `python-dotenv` to load these into your settings.
    Example variables in `.env` or directly in `settings.py` (less secure for secrets):
    ```env
    SECRET_KEY='your_django_secret_key'
    DEBUG=True
    DATABASE_URL='postgres://user:password@host:port/dbname' # If using PostgreSQL
    # Or individual DB settings: DB_ENGINE, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
    # Settings for Twilio/Firebase, Cloudinary, etc.
    ```
*   **Apply migrations:**
    ```bash
    python manage.py migrate
    ```

**4. Database Setup**

*   **MongoDB:**
    *   Ensure your MongoDB server is running.
    *   The connection string will be used in your backend's environment variables (`MONGODB_URI`).
    *   No specific schema setup is needed beforehand if using Mongoose, as it will handle it.
*   **PostgreSQL/MySQL (if using Django):**
    *   Ensure your PostgreSQL or MySQL server is running.
    *   Create a database for the project.
    *   Update your backend configuration (`settings.py` or `.env`) with the database credentials.
    *   Django's `migrate` command (run above) will set up the necessary tables based on your models.

**5. Configure Third-Party Services**

*   **Firebase/Twilio (for OTP):**
    *   Sign up for a Firebase or Twilio account.
    *   Obtain your API keys/credentials.
    *   Add these credentials to your backend's environment variables or configuration files.
*   **Cloudinary/Firebase Storage (for Aadhaar uploads):**
    *   Sign up for a Cloudinary or Firebase account.
    *   Obtain API keys and storage bucket details.
    *   Configure these in your backend.
*   **Google Maps JavaScript API:**
    *   Enable the Google Maps JavaScript API in the Google Cloud Console.
    *   Get an API key.
    *   Add it to your frontend's environment variables.
*   **Razorpay (Optional - for payments):**
    *   Sign up for a Razorpay sandbox account.
    *   Get your Key ID and Key Secret.
    *   Add the Key ID to your frontend and both Key ID and Key Secret to your backend (if payments are processed server-side).

## ▶️ Running the Application

After completing the setup steps:

**1. Start the Backend Server:**

*   **For Node.js + Express.js:**
    Navigate to the `backend` directory and run:
    ```bash
    npm start
    # Or, if you have a dev script in package.json (e.g., using nodemon)
    npm run dev
    ```
    The backend server will typically start on the port specified in your environment variables (e.g., `http://localhost:5000`).

*   **For Django:**
    Navigate to the `backend` directory (where `manage.py` is located) and ensure your virtual environment is activated. Then run:
    ```bash
    python manage.py runserver
    ```
    The Django development server will typically start on `http://localhost:8000`.

**2. Start the Frontend Development Server:**

*   Navigate to the `frontend` directory and run:
    ```bash
    npm start
    # OR
    yarn start
    ```
    This will usually open the application in your default web browser, often at `http://localhost:3000`.

**3. Access the Application:**

Open your web browser and go to the frontend URL (e.g., `http://localhost:3000`). The frontend will communicate with the backend API.

## 🚀 Future Enhancements

*   **Mobile App:** Develop a mobile application using React Native or Flutter for a native mobile experience.
*   **SMS Alerts:** Implement SMS notifications for booking confirmations, delays, or cancellations.
*   **Auto-Renewal for Bus Passes:** Introduce an option for automatic renewal of monthly bus passes.
*   **AI-Based Route Recommendation:** Integrate AI to suggest optimal routes based on user preferences or real-time conditions.
*   **Advanced Analytics:** More detailed analytics and reporting features for the admin module.
*   **Multilingual Support:** Add support for multiple languages, including Marathi.

## 🤝 Contributing

Contributions are welcome to improve the Ichalkaranji Bus Booking and Pass System (IBBPS). If you'd like to contribute, please follow these general guidelines:

1.  **Fork the Repository:** Create your own fork of the project.
2.  **Create a New Branch:** Make your changes in a dedicated branch.
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit Your Changes:** Write clear and concise commit messages.
    ```bash
    git commit -m "Add: Implement X feature"
    ```
4.  **Push to Your Branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request:** Submit a pull request from your forked repository to the main project repository. Clearly describe the changes you've made and why.

Please ensure your code adheres to any existing coding standards and includes tests where applicable.
