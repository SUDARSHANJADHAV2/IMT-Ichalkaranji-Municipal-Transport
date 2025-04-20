// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Pass type selection
    const passTypeCards = document.querySelectorAll('.pass-type-card');
    const passTypeSelect = document.getElementById('pass-type');
    const passApplicationForm = document.getElementById('pass-application-form');
    const submitApplicationBtn = document.getElementById('submit-application');
    const requestOTPBtn = document.getElementById('request-otp');
    const verifyOTPBtn = document.getElementById('verify-otp');
    const resendOTPBtn = document.getElementById('resend-otp');
    const otpVerificationSection = document.querySelector('.otp-verification');
    const maskedMobileSpan = document.getElementById('masked-mobile');
    const studentIdSection = document.getElementById('student-id-section');

    // File upload elements
    const aadhaarUploadInput = document.getElementById('aadhaar-upload');
    const aadhaarUploadPreview = document.querySelector('#aadhaar-upload').closest('.upload-area').querySelector('.upload-preview');
    const aadhaarUploadPlaceholder = document.querySelector('#aadhaar-upload').closest('.upload-area').querySelector('.upload-placeholder');
    const studentIdUploadInput = document.getElementById('student-id-upload');
    const removeFileBtn = document.querySelector('.remove-file');

    // OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');

    // Initialize state
    let otpResendTimer = null;
    let currentPassType = 'student';
    let isOtpVerified = false;

    // Initialize form
    initPassTypeSelection();
    initFileUploads();
    initOTPInputHandling();
    initFormSubmission();

    // Functions
    function initPassTypeSelection() {
        // Initialize the pass type cards
        passTypeCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                passTypeCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update the select dropdown value
                const passType = this.getAttribute('data-type');
                passTypeSelect.value = passType;
                
                // Update the current pass type
                currentPassType = passType;
                
                // Show/hide additional ID proof sections based on pass type
                updateIdProofSection(passType);
            });
        });

        // Handle dropdown changes
        passTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            // Update the active pass type card
            passTypeCards.forEach(card => {
                if (card.getAttribute('data-type') === selectedValue) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
            
            // Update the current pass type
            currentPassType = selectedValue;
            
            // Show/hide additional ID proof sections based on pass type
            updateIdProofSection(selectedValue);
        });
    }

    function updateIdProofSection(passType) {
        // Show/hide relevant ID proof sections based on pass type
        if (passType === 'student') {
            studentIdSection.style.display = 'block';
            studentIdUploadInput.setAttribute('required', 'required');
        } else {
            studentIdSection.style.display = 'none';
            studentIdUploadInput.removeAttribute('required');
        }
    }

    function initFileUploads() {
        // Aadhaar file upload handling
        aadhaarUploadInput.addEventListener('change', function(e) {
            handleFileUpload(this, aadhaarUploadPreview, aadhaarUploadPlaceholder);
        });

        // Student ID file upload handling (if present)
        if (studentIdUploadInput) {
            const studentIdUploadPreview = studentIdUploadInput.closest('.upload-area').querySelector('.upload-preview');
            const studentIdUploadPlaceholder = studentIdUploadInput.closest('.upload-area').querySelector('.upload-placeholder');
            
            studentIdUploadInput.addEventListener('change', function(e) {
                handleFileUpload(this, studentIdUploadPreview, studentIdUploadPlaceholder);
            });
        }

        // Remove file button
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', function() {
                // Clear the file input
                aadhaarUploadInput.value = '';
                // Hide preview, show placeholder
                aadhaarUploadPreview.style.display = 'none';
                aadhaarUploadPlaceholder.style.display = 'flex';
            });
        }
    }

    function handleFileUpload(inputElement, previewElement, placeholderElement) {
        const file = inputElement.files[0];
        
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit. Please upload a smaller file.');
                inputElement.value = '';
                return;
            }
            
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a PDF, JPG, or PNG file.');
                inputElement.value = '';
                return;
            }
            
            // Update preview if available
            if (previewElement) {
                const fileNameElement = previewElement.querySelector('.file-name');
                if (fileNameElement) {
                    fileNameElement.textContent = file.name;
                }
                previewElement.style.display = 'flex';
                placeholderElement.style.display = 'none';
            }
        }
    }

    function initOTPInputHandling() {
        // Auto-focus next input on OTP entry
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                // Only allow numbers
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Move to next input if value is entered
                if (this.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !this.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        // Verify OTP button
        verifyOTPBtn.addEventListener('click', function() {
            const otpValue = Array.from(otpInputs).map(input => input.value).join('');
            
            if (otpValue.length !== 6) {
                showToast('Please enter all 6 digits of the OTP.');
                return;
            }
            
            // Mock OTP verification - In a real app, this would make an API call
            mockVerifyOTP(otpValue);
        });

        // Resend OTP button
        resendOTPBtn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                return;
            }
            
            // Clear existing OTP inputs
            otpInputs.forEach(input => {
                input.value = '';
            });
            
            // Mock resend OTP - In a real app, this would make an API call
            mockResendOTP();
        });
    }

    function initFormSubmission() {
        // Request OTP button
        requestOTPBtn.addEventListener('click', function() {
            if (validateFormBeforeOTP()) {
                const mobileNumber = document.getElementById('applicant-mobile').value;
                showOTPSection(mobileNumber);
                
                // Mock send OTP - In a real app, this would make an API call
                mockSendOTP(mobileNumber);
            }
        });

        // Form submission
        passApplicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isOtpVerified) {
                // First stage - validate and request OTP
                if (validateFormBeforeOTP()) {
                    // Hide submit button, show request OTP button
                    submitApplicationBtn.style.display = 'none';
                    requestOTPBtn.style.display = 'block';
                    
                    // Trigger the requestOTP button to simplify the flow
                    requestOTPBtn.click();
                }
            } else {
                // Final submission
                submitPassApplication();
            }
        });
    }

    function validateFormBeforeOTP() {
        // Basic validation
        if (!passApplicationForm.checkValidity()) {
            passApplicationForm.reportValidity();
            return false;
        }
        
        // Custom validation
        const aadhaarNumber = document.getElementById('aadhaar-number').value;
        if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
            showToast('Please enter a valid 12-digit Aadhaar number.');
            return false;
        }
        
        const mobileNumber = document.getElementById('applicant-mobile').value;
        if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
            showToast('Please enter a valid 10-digit mobile number.');
            return false;
        }
        
        return true;
    }

    function showOTPSection(mobileNumber) {
        // Display the OTP verification section
        otpVerificationSection.style.display = 'block';
        
        // Mask the mobile number for display
        maskedMobileSpan.textContent = '+91 XXXXX-' + mobileNumber.substring(mobileNumber.length - 4);
        
        // Focus on first OTP input
        otpInputs[0].focus();
    }

    function mockSendOTP(mobileNumber) {
        // In a real app, this would make an API call to send an OTP
        console.log(`Sending OTP to ${mobileNumber}`);
        
        // Start the resend timer
        startResendOTPTimer();
        
        // For demo purposes, show a toast
        showToast(`OTP sent to ${mobileNumber}. For demo, use "123456"`);
    }

    function mockResendOTP() {
        // In a real app, this would make an API call to resend an OTP
        console.log('Resending OTP');
        
        // Start the resend timer
        startResendOTPTimer();
        
        // For demo purposes, show a toast
        showToast('OTP resent. For demo, use "123456"');
    }

    function mockVerifyOTP(otpValue) {
        // In a real app, this would make an API call to verify the OTP
        console.log(`Verifying OTP: ${otpValue}`);
        
        // For demo purposes, accept "123456" as valid OTP
        if (otpValue === '123456') {
            isOtpVerified = true;
            
            // Show success message
            showToast('OTP verified successfully!');
            
            // Update UI to show verification success
            otpVerificationSection.innerHTML = `
                <div class="verification-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Mobile Verified Successfully!</h4>
                    <p>You can now proceed with the application.</p>
                </div>
            `;
            
            // Show submit button, hide request OTP button
            requestOTPBtn.style.display = 'none';
            submitApplicationBtn.style.display = 'block';
            submitApplicationBtn.textContent = 'Submit Application';
        } else {
            showToast('Invalid OTP. Please try again. For demo, use "123456"');
        }
    }

    function startResendOTPTimer() {
        // Disable the resend button and start countdown
        resendOTPBtn.classList.add('disabled');
        
        let secondsLeft = 30;
        resendOTPBtn.textContent = `Resend OTP (${secondsLeft}s)`;
        
        // Clear any existing timer
        if (otpResendTimer) {
            clearInterval(otpResendTimer);
        }
        
        // Start the countdown
        otpResendTimer = setInterval(() => {
            secondsLeft--;
            resendOTPBtn.textContent = `Resend OTP (${secondsLeft}s)`;
            
            if (secondsLeft <= 0) {
                clearInterval(otpResendTimer);
                resendOTPBtn.classList.remove('disabled');
                resendOTPBtn.textContent = 'Resend OTP';
            }
        }, 1000);
    }

    function submitPassApplication() {
        // Collect form data
        const formData = new FormData(passApplicationForm);
        
        // Add the pass type
        formData.append('passType', currentPassType);
        
        // In a real app, this would make an API call to submit the application
        console.log('Submitting pass application');
        console.log('Pass Type:', currentPassType);
        console.log('Name:', formData.get('applicant-name'));
        console.log('Mobile:', formData.get('applicant-mobile'));
        
        // Show loading state
        submitApplicationBtn.disabled = true;
        submitApplicationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Mock API call - simulate delay
        setTimeout(() => {
            // Show success message
            showSubmissionSuccess();
        }, 2000);
    }

    function showSubmissionSuccess() {
        // Replace form with success message
        const successMessage = `
            <div class="submission-success">
                <i class="fas fa-check-circle"></i>
                <h3>Application Submitted Successfully!</h3>
                <p>Your bus pass application has been received and is being processed.</p>
                <div class="application-details">
                    <p><strong>Application ID:</strong> <span id="application-id">BP${Math.floor(Math.random() * 90000) + 10000}</span></p>
                    <p><strong>Status:</strong> <span class="status pending">Pending Verification</span></p>
                </div>
                <p class="info-text">You will receive a notification on your registered mobile number once your application is verified.</p>
                <div class="next-actions">
                    <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
                    <a href="index.html" class="btn btn-outline">Back to Home</a>
                </div>
            </div>
        `;
        
        document.querySelector('.application-form-container').innerHTML = successMessage;
    }

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
});