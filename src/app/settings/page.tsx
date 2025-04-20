// src/app/settings/page.tsx  <-- Updated file path
'use client'; // This is a client component for interactivity and data fetching

import React, { useState, useEffect } from 'react';
// No useParams or Link needed on a general settings page


// Assume a User interface that includes the fields we want to display
// This interface should match the structure of your user data from the backend
interface User {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string; // Optional URL to the user's profile picture
    faculty?: string | null; // Optional, and can be null or undefined
    course?: string | null;   // Optional, and can be null or undefined
    year?: number | null;     // Optional, and can be null or undefined
    // Add other relevant user fields
}


// Assuming a CSS Module for settings page specific styles
import styles from './settings.module.css'; // <-- Updated import path and file name


// --- Define Mock Data ---

// Mock data for different user types
const mockStudentUser: User = {
    id: 'student-user-456',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    profileImageUrl: 'https://i.pravatar.cc/150?u=jane.smith@example.com', // Example mock profile image URL
    faculty: 'Engineering',
    course: 'Civil Engineering',
    year: 2,
};

const mockLecturerUser: User = {
    id: 'lecturer-user-789',
    name: 'Dr. Emily Johnson',
    email: 'emily.johnson@university.com',
    profileImageUrl: 'https://i.pravatar.cc/150?u=emily.johnson@university.com', // Example mock profile image URL
    faculty: 'Science',
    course: null, // Lecturer might not have a specific 'Course' in this context
    year: null,    // Lecturer might not have a 'Year'
};

const mockBasicUser: User = {
     id: 'basic-user-010',
     name: 'Basic User',
     email: 'basic.user@platform.com',
     profileImageUrl: undefined, // No profile image initially
     faculty: undefined,
     course: undefined,
     year: undefined,
};


// --- End Mock Data ---


export default function SettingsPage() { // <-- Updated component name
    // --- State for data and loading ---
    const [user, setUser] = useState<User | null>(null); // State to hold current user data fetched from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for Change Password form ---
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // --- State for the process of changing password ---
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

    // --- State for Profile Picture Upload (if implemented) ---
    const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
    const [displayProfileImageUrl, setDisplayProfileImageUrl] = useState<string | undefined>(undefined); // URL for display (current or preview)
    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
    const [profileImageUploadError, setProfileImageUploadError] = useState<string | null>(null);
    const [profileImageUploadSuccess, setProfileImageUploadSuccess] = useState<string | null>(null);


    // --- Data Loading (using Mock Data) ---
    // Simulate fetching the logged-in user's data when the component mounts
    useEffect(() => {
        const loadMockUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate a network request delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // --- Use mock user data based on a condition (e.g., user ID or role) ---
                // In a real app, this would be determined by the logged-in user's session/token
                // For mock purposes, let's pick one, or perhaps use a query param if you need to test others easily
                const userData: User = mockLecturerUser; // <-- Choose which mock user to load here for testing
                setUser(userData);

                 // Set the initial profile image URL to display
                 setDisplayProfileImageUrl(userData.profileImageUrl);


            } catch (e: any) {
                console.error("Error loading user data:", e); // <-- Updated console log
                setError(`Failed to load user data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockUserData();

    }, []); // The empty dependency array means this effect runs only once on component mount


    // --- Handlers ---

    // Handle file selection for profile image upload
    const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setNewProfileImageFile(file || null); // Store the selected file
        setProfileImageUploadError(null); // Clear previous feedback
        setProfileImageUploadSuccess(null);

        if (file) {
             // Display a preview of the selected image instantly
             const reader = new FileReader();
             reader.onloadend = () => {
                 setDisplayProfileImageUrl(reader.result as string); // Set the preview URL
             };
             reader.readAsDataURL(file);
        } else {
             // If file selection is cancelled, revert to the current user's image
             setDisplayProfileImageUrl(user?.profileImageUrl);
        }
    };

    // Handle the action to upload/change the profile picture (Simulated)
    const handleUploadProfileImage = async () => {
        if (!user || !newProfileImageFile) {
            setProfileImageUploadError("No new profile image selected.");
            return;
        }

        setIsUploadingProfileImage(true);
        setProfileImageUploadError(null);
        setProfileImageUploadSuccess(null);

        const formData = new FormData();
        formData.append('profileImage', newProfileImageFile);
        formData.append('userId', user.id); // Include user ID

        console.log("Simulating uploading profile image...");

        // TODO: Implement the actual API call to upload the profile image
        // Example: fetch(`/api/settings/profile/image`, { // <-- Potential API route update
        //     method: 'POST', // Or PUT
        //     body: formData, // FormData handles content type
        // });

         // --- Simulate State Update After Successful Upload ---
         try {

              // Simulate the backend returning the new image URL
              const simulatedNewImageUrl = `simulated-upload-url/${user.id}-${Date.now()}-${newProfileImageFile.name}`;

              // Update the user state with the new image URL
              setUser(prevUser => prevUser ? { ...prevUser, profileImageUrl: simulatedNewImageUrl } : null);
              setDisplayProfileImageUrl(simulatedNewImageUrl); // Ensure the displayed image is updated

              setProfileImageUploadSuccess("Profile image updated successfully!"); // Show success message
              setNewProfileImageFile(null); // Clear the selected file state
              // Reset the file input visually (requires ref or direct DOM access)
              const fileInput = document.getElementById('profileImage') as HTMLInputElement;
              if (fileInput) fileInput.value = '';


         } catch (e: any) {
             // In a real app, catch API errors here
             console.error("Simulated profile image upload error:", e); // <-- Updated console log
             setProfileImageUploadError(`Failed to upload image: ${e.message || 'Unknown error'}`);
             setProfileImageUploadSuccess(null); // Ensure success message is cleared
         } finally {
             setIsUploadingProfileImage(false);
         }
         // --- End Simulated State Update ---
    };


    // Handle changes in the change password form inputs
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFormData(prevData => ({ ...prevData, [name]: value }));
        // Clear any previous success/error messages when the user starts typing again
        setPasswordChangeError(null);
        setPasswordChangeSuccess(null);
    };

    // Handle the action to change password
    const handleChangePassword = async () => {
        // Basic client-side validation
        if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmNewPassword) {
            setPasswordChangeError("All password fields are required.");
            return;
        }
        if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
            setPasswordChangeError("New password and confirmation do not match.");
            return;
        }
         // TODO: Add more complex password strength validation if needed


        setIsChangingPassword(true);
        setPasswordChangeError(null);
        setPasswordChangeSuccess(null);

        console.log("Simulating changing password...");

        // TODO: Implement the actual API call to change the password
        // Example: fetch(`/api/settings/change-password`, { // <-- Potential API route update
        //     method: 'POST', // Typically a POST request
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         currentPassword: passwordFormData.currentPassword,
        //         newPassword: passwordFormData.newPassword,
        //         // Confirmation is validated client-side, no need to send it to backend
        //     }),
        // });


        // --- Simulate State Update After Successful Password Change ---
        // In a real app, you would do this inside the .then() or try block of your fetch call
        // The backend API should return success or a specific error (e.g., 'invalid current password')
        try {
             // Simulate a delay for the API call
             await new Promise(resolve => setTimeout(resolve, 1500));

              // Simulate a successful password change
             setPasswordChangeSuccess("Password changed successfully!"); // Show success message
             // Clear the password form fields on success
             setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

             // If the backend returned an error (e.g., incorrect current password),
             // you would catch it here and set setPasswordChangeError accordingly.

        } catch (e: any) {
            // In a real app, catch API errors here
            console.error("Simulated change password error:", e); // <-- Updated console log
            setPasswordChangeError(`Failed to change password: ${e.message || 'Unknown error'}`);
            setPasswordChangeSuccess(null); // Ensure success message is cleared
        } finally {
            setIsChangingPassword(false);
        }
        // --- End Simulated State Update ---
    };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Settings</h2>{/* <-- Updated Title */}
                <p className="loading-message">Loading settings data...</p> {/* <-- Updated message */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Settings</h2>{/* <-- Updated Title */}
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    // If user data is loaded (not loading, no error, user is not null)
    // Render the settings forms
    // Added a check for !user here, though the error state should cover it
    if (!user) {
        return (
             <div className="page-content-wrapper">
                <h2 className="page-title">Settings</h2>{/* <-- Updated Title */}
                <p className="error-message">User data not available.</p>
            </div>
        );
    }


    return (
        <div className="page-content-wrapper"> {/* Reuse existing wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Settings</h2>{/* <-- Updated Title */}

            {/* --- Profile Information Section (Read-only except for image) --- */}
             {/* Reuse form-container for card styling */}
             <div className="form-container">
                 <h3>Profile Information</h3>
                  {/* Use CSS Module for layout of this section */}
                  <div className={styles["profile-section"]}>

                     {/* Profile Picture Area */}
                     {/* Use CSS Module for layout within this area */}
                     <div className={styles["profile-picture-area"]}>
                         {/* The profile image display */}
                         <img
                             src={displayProfileImageUrl || '/default-avatar.png'} // Display the current or preview image, or default
                             alt={`${user.name}'s profile picture`}
                             className={styles["profile-image"]} // Use CSS Module for styling
                             width={100} // Set desired display size for image
                             height={100}
                         />

                          {/* File input and button for uploading new profile picture */}
                           <div className="form-group" style={{ marginTop: '10px' }}>
                               {/* Styled label acting as a button */}
                               <label htmlFor="profileImage" className="button-secondary" style={{ cursor: isUploadingProfileImage ? 'not-allowed' : 'pointer' }}>
                                    {isUploadingProfileImage ? 'Uploading...' : 'Change Photo'}
                               </label>
                                {/* Hidden actual file input */}
                                <input
                                   type="file"
                                   id="profileImage"
                                   accept="image/*" // Specify accepted file types (images)
                                   onChange={handleProfileImageSelect}
                                    disabled={isUploadingProfileImage} // Disable input while uploading
                                   style={{ display: 'none' }} // Hide the default browser file input
                                />
                                 {/* Display the name of the selected file */}
                                 {newProfileImageFile && (
                                     <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>{newProfileImageFile.name} selected</span>
                                 )}
                           </div>
                            {/* Upload button for the selected file */}
                            {newProfileImageFile && (
                                 <button
                                     className="button-primary"
                                     onClick={handleUploadProfileImage}
                                     disabled={isUploadingProfileImage}
                                     style={{ marginTop: '10px' }}
                                 >
                                     Upload Photo
                                 </button>
                            )}


                            {/* Profile Image Upload Feedback Messages */}
                            {profileImageUploadError && <p className="error-message" style={{ marginTop: '10px' }}>{profileImageUploadError}</p>}
                            {profileImageUploadSuccess && <p className="success-message" style={{ marginTop: '10px' }}>{profileImageUploadSuccess}</p>}

                     </div>


                     {/* Profile Details (Read-only Display) */}
                     {/* Use CSS Module for layout of the displayed fields */}
                     <div className={styles["profile-details-display"]}> {/* Changed class name as it's display, not a form */}

                        {/* Name Display */}
                        {/* Reuse global form-group style for layout/spacing */}
                        <div className="form-group">
                             <label>Name:</label> {/* Use label for clarity */}
                              <p>{user.name}</p> {/* Display name directly */}
                        </div>

                         {/* Email Display */}
                         <div className="form-group">
                              <label>Email:</label>
                              <p>{user.email}</p> {/* Display email directly */}
                         </div>

                         {/* Academic Details (Conditionally Rendered Display) */}
                         {/* Only render if data exists and is not empty/null */}
                         {(user.faculty !== undefined && user.faculty !== null) && ( // Render if faculty exists and is not null/undefined
                              <div className="form-group">
                                   <label>Faculty:</label>
                                   <p>{user.faculty || 'N/A'}</p> {/* Display faculty or 'N/A' if it was explicitly null */}
                              </div>
                         )}
                         {(user.course !== undefined && user.course !== null) && ( // Render if course exists and is not null/undefined
                               <div className="form-group">
                                   <label>Course:</label>
                                   <p>{user.course || 'N/A'}</p> {/* Display course or 'N/A' */}
                              </div>
                         )}
                         {(user.year !== undefined && user.year !== null) && ( // Render if year exists and is not null/undefined
                               <div className="form-group">
                                   <label>Year:</label>
                                   <p>{user.year}</p> {/* Display year */}
                              </div>
                         )}


                         {/* Removed Save Profile Button */}

                     </div>

                  </div>
             </div>


            {/* --- Change Password Section --- */}
             {/* Reuse form-container */}
             <div className="form-container">
                 <h3>Change Password</h3>
                  {/* Use CSS Module for layout of the password form inputs */}
                  <div className={styles["change-password-form"]}>

                     <div className="form-group"> {/* Reuse global form-group */}
                         <label htmlFor="currentPassword">Current Password:</label>
                         <input
                            type="password" // Use type="password" to hide input
                            id="currentPassword"
                            name="currentPassword" // Match state key
                            value={passwordFormData.currentPassword}
                            onChange={handlePasswordInputChange}
                             disabled={isChangingPassword} // Disable input while changing password
                         />
                     </div>

                     <div className="form-group"> {/* Reuse global form-group */}
                         <label htmlFor="newPassword">New Password:</label>
                         <input
                            type="password" // Use type="password" to hide input
                            id="newPassword"
                            name="newPassword" // Match state key
                            value={passwordFormData.newPassword}
                            onChange={handlePasswordInputChange}
                             disabled={isChangingPassword} // Disable input while changing password
                         />
                     </div>

                      <div className="form-group"> {/* Reuse global form-group */}
                         <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                         <input
                            type="password" // Use type="password" to hide input
                            id="confirmNewPassword"
                            name="confirmNewPassword" // Match state key
                            value={passwordFormData.confirmNewPassword}
                            onChange={handlePasswordInputChange}
                             disabled={isChangingPassword} // Disable input while changing password
                         />
                     </div>

                     {/* Change Password Button */}
                      <button
                         className="button-primary" // Reuse global button style
                         onClick={handleChangePassword}
                          disabled={isChangingPassword} // Disable button while changing password
                      >
                          {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </button>

                     {/* Change Password Feedback Messages */}
                     {passwordChangeError && <p className="error-message" style={{ marginTop: '10px' }}>{passwordChangeError}</p>}
                     {passwordChangeSuccess && <p className="success-message" style={{ marginTop: '10px' }}>{passwordChangeSuccess}</p>} {/* Reuse global success style */ }

                  </div>
             </div>


            {/* --- Other Optional Sections (Placeholders) --- */}
            {/* Include other sections here if needed, following the form-container pattern */}
            
        



        </div>
    );
}