// src/app/events/[id]/media/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Assuming a data structure for a Media File
interface MediaFile {
    id: string;
    eventId: string;
    fileName: string;
    fileUrl: string; // URL to access the file
    fileType: string; // e.g., 'image/jpeg', 'image/png'
    uploadedBy: string; // User ID or name
    uploadDate: string; // ISO string
    category?: string; // e.g., 'Poster', 'Event Photo'
    caption?: string; // Optional caption
    // Add other metadata
}

// Define possible media categories (optional)
const mediaCategories = ['Event Photos', 'Posters', 'Logos', 'Other']; // Example categories


// Assuming a CSS Module for media page specific styles
import styles from './media.module.css'; // Create this CSS module


// --- Define Mock Data ---

// Mock data for uploaded media files
const mockMediaFiles: MediaFile[] = [
    {
        id: 'media-1', eventId: 'mock-event-1', fileName: 'event-poster.png', fileUrl: '/mock-media/event-poster.png',
        fileType: 'image/png', uploadedBy: 'Alice Wonderland', uploadDate: '2025-04-01T10:00:00Z', category: 'Posters', caption: 'Official Event Poster'
    },
    {
        id: 'media-2', eventId: 'mock-event-1', fileName: 'keynote-speaker.jpg', fileUrl: '/mock-media/keynote-speaker.jpg',
        fileType: 'image/jpeg', uploadedBy: 'Bob The Builder', uploadDate: '2025-04-20T14:30:00Z', category: 'Event Photos', caption: 'Keynote Speaker presenting'
    },
     {
        id: 'media-3', eventId: 'mock-event-1', fileName: 'attendees-networking.jpg', fileUrl: '/mock-media/attendees-networking.jpg',
        fileType: 'image/jpeg', uploadedBy: 'Charlie Chaplin', uploadDate: '2025-04-20T15:00:00Z', category: 'Event Photos', caption: 'Attendees networking'
    },
     {
        id: 'media-4', eventId: 'mock-event-1', fileName: 'company-logo.png', fileUrl: '/mock-media/company-logo.png',
        fileType: 'image/png', uploadedBy: 'Alice Wonderland', uploadDate: '2025-03-15T09:00:00Z', category: 'Logos', caption: 'Company Logo'
    },
];
// --- End Mock Data ---


export default function EventMediaPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State for data and loading ---
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);// State to hold uploaded media files
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for upload process ---
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null); // Files selected by user
    const [uploading, setUploading] = useState(false); // State for upload loading
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [uploadCategory, setUploadCategory] = useState<string>(mediaCategories[0] || ''); // Selected category for upload
    // Optional: State for a single caption applied to all selected files (if multi-upload) or a way to add caption per file


    // --- Data Loading (using Mock Data for initial media list) ---
    useEffect(() => {
        const loadMockMedia = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate data loading delay (optional)

                // Use mock data directly for the initial media list
                const data: MediaFile[] = mockMediaFiles;
                setMediaFiles(data);

            } catch (e: any) {
                console.error("Error loading mock media data:", e);
                setError(`Failed to load mock media data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockMedia();

    }, [eventId]); // Rerun if eventId changes


    // --- Handlers ---

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files);
        setUploadError(null); // Clear previous errors
        setUploadSuccess(null); // Clear previous success messages
        // Reset category if needed, or default to first
        setUploadCategory(mediaCategories[0] || '');
        // Optional: Reset caption state
    };

    // Handle upload category change
    const handleUploadCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUploadCategory(e.target.value);
    };


    // Handle triggering the upload process (Simulated with state update)
    const handleUploadFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setUploadError('Please select files to upload.');
            return;
        }

        setUploading(true);
        setUploadError(null);
        setUploadSuccess(null);

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('mediaFiles', selectedFiles[i]); // Append files
        }
        formData.append('eventId', eventId); // Include event ID
        formData.append('category', uploadCategory); // Include selected category
        // Optional: Add caption or other metadata to formData

        console.log(`Simulating uploading ${selectedFiles.length} files to event ${eventId} in category ${uploadCategory}`);
        //console.log("FormData (simulated):", formData); // Can't easily inspect FormData directly

        // TODO: Implement API call to upload files
        // Example: fetch(`/api/events/${eventId}/media/upload`, {
        //     method: 'POST',
        //     body: formData, // FormData handles setting Content-Type header for file uploads
        // });

        // --- Simulate State Update for Upload ---
        // In a real app, you would make an API call here.
        // On success, the backend would return the details of the uploaded files (with IDs, URLs, etc.).
        // You would then update the `mediaFiles` state with these new items.
        try {

             // Simulate the backend returning the new file data
             const uploadedFileDetails: MediaFile[] = Array.from(selectedFiles).map((file, index) => ({
                 id: `media-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`, // Mock ID
                 eventId: eventId,
                 fileName: file.name,
                 fileUrl: `/mock-media/${file.name}`, // Simulate a URL where the file would be accessible
                 fileType: file.type,
                 uploadedBy: 'Current User (Mock)', // TODO: Get actual current user info
                 uploadDate: new Date().toISOString(),
                 category: uploadCategory,
                 caption: 'Mock Caption', // TODO: Get actual caption
             }));

            setMediaFiles(prevMedia => [...prevMedia, ...uploadedFileDetails]); // Add new files to the list
            setUploadSuccess(`${uploadedFileDetails.length} file(s) uploaded successfully!`); // Show success message
            setUploadError(null); // Clear any previous errors

            // Reset upload form state
            setSelectedFiles(null); // Clear selected files from the input
            const fileInput = document.getElementById('mediaFileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = ''; // Reset the file input visually
            // setReceiptFileName(null); // Clear displayed file name

        } catch (e: any) {
            console.error("Simulated upload error:", e);
            setUploadError(`Upload failed: ${e.message || 'Unknown error'}`);
            setUploadSuccess(null);
        } finally {
            setUploading(false); // Hide loading indicator
        }
        // --- End Simulate State Update ---
    };

    // Handle deleting a media file (Simulated with state update)
    const handleDeleteMedia = async (mediaId: string, fileName: string) => {
        console.log(`Simulating deleting media file ${fileName} (ID: ${mediaId}) from event ${eventId}`);

        // TODO: Add confirmation dialog before deleting

        setLoading(true); // Show overall loading while deleting (can use separate state if preferred)
        setError(null); // Clear previous errors

        // TODO: Implement API call to delete the media file
        // Example: fetch(`/api/events/${eventId}/media/${mediaId}`, {
        //     method: 'DELETE',
        // });

        // --- Simulate State Update for Deleting Media ---
        // In a real app, you would make an API call here.
        // On success, update the state.
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            setMediaFiles(prevMedia => prevMedia.filter(media => media.id !== mediaId)); // Remove from the list
            console.log("Simulated successful media deletion.");

        } catch (e: any) {
            console.error("Simulated delete media error:", e);
            setError(`Failed to delete media file: ${e.message || 'Unknown error'}`);
        } finally {
            setLoading(false); // Hide loading indicator
        }
        // --- End Simulated State Update ---
    };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Event Media</h2>
                <p className="loading-message">Loading media files...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Event Media</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    const hasMediaFiles = mediaFiles && mediaFiles.length > 0;
    const hasCategoriesForUpload = mediaCategories && mediaCategories.length > 0;


    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Event Media</h2>

            {/* --- Upload Media Section --- */}
             <div className="form-container"> {/* Reuse form-container for card styling */}
                 <h3>Upload Media Files</h3>
                  <div className={styles["upload-section"]}> {/* Use CSS Module for layout */}
                     <div className="form-group"> {/* Reuse form-group for spacing */}
                         <label htmlFor="mediaFileInput" className="button-secondary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                             {uploading ? 'Uploading...' : 'Select Files'}
                         </label>
                         <input
                            type="file"
                            id="mediaFileInput"
                            multiple // Allow multiple file selection
                            accept="image/*" // Accept any image type
                            onChange={handleFileSelect}
                            disabled={uploading}
                            style={{ display: 'none' }} // Hide the default file input
                         />
                         {/* Display selected file names */}
                         {selectedFiles && selectedFiles.length > 0 && (
                             <span style={{ marginLeft: '10px' }}>
                                 {selectedFiles.length} file(s) selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                             </span>
                         )}
                     </div>

                     {/* Optional: Category Selection for Upload */}
                     {hasCategoriesForUpload && (
                         <div className="form-group" style={{ marginTop: '15px' }}> {/* Reuse form-group, add spacing */}
                              <label htmlFor="uploadCategory">Category:</label>
                              <select
                                  id="uploadCategory"
                                  value={uploadCategory}
                                  onChange={handleUploadCategoryChange}
                                  disabled={uploading}
                              >
                                  {mediaCategories.map(category => (
                                      <option key={category} value={category}>{category}</option>
                                  ))}
                              </select>
                         </div>
                     )}
                      {/* Optional: Caption Input for Upload (if applying one caption to all) */}
                       {/* <div className="form-group">
                          <label htmlFor="uploadCaption">Caption (Optional):</label>
                          <input
                             type="text"
                             id="uploadCaption"
                             value={uploadCaption} // State for upload caption
                             onChange={(e) => setUploadCaption(e.target.value)}
                             disabled={uploading}
                          />
                       </div> */}


                     {/* Upload Button */}
                     <button
                         className="button-primary" // Reuse button style
                         onClick={handleUploadFiles}
                         disabled={!selectedFiles || selectedFiles.length === 0 || uploading || !uploadCategory} // Disable if no files, uploading, or no category selected
                         style={{ marginTop: '20px' }} // Add space above button
                     >
                         {uploading ? 'Uploading...' : 'Upload Files'}
                     </button>

                     {/* Upload Feedback */}
                     {uploading && <p className="loading-message" style={{ marginTop: '10px' }}>Uploading...</p>}
                     {uploadError && <p className="error-message" style={{ marginTop: '10px' }}>{uploadError}</p>}
                     {uploadSuccess && <p className="loading-message" style={{ marginTop: '10px' }}>{uploadSuccess}</p>} {/* Using loading style for success */ }
                  </div>
             </div>


            {/* --- Media Gallery / Display Section --- */}
             <div className="form-container"> {/* Reuse form-container */}
                <h3>Uploaded Media ({mediaFiles.length})</h3>

                 {/* Optional: Filter/Sort controls */}
                 {/* <div className={styles["gallery-controls"]}>
                     // Filter by Category Dropdown
                     // Sort by Date/Name Dropdown
                 </div> */}

                 {hasMediaFiles ? (
                     <div className={styles["media-gallery"]}> {/* Use CSS Module for the gallery grid */}
                         {mediaFiles.map(media => (
                             <div key={media.id} className={styles["media-item"]}> {/* Use CSS Module for each item */}
                                  {/* The image itself */}
                                  {media.fileType.startsWith('image/') ? (
                                      <img
                                         src={media.fileUrl}
                                         alt={media.caption || media.fileName}
                                         className={styles["media-image"]} // Use CSS Module
                                         // Optional: Add onClick to view larger
                                         // onClick={() => handleViewMedia(media)}
                                      />
                                  ) : (
                                      // Handle other file types if necessary
                                      <div className={styles["file-icon"]}>File ({media.fileType})</div>
                                  )}

                                  {/* Media details */}
                                  <div className={styles["media-details"]}> {/* Use CSS Module */}
                                     <p className={styles["file-name"]}>{media.fileName}</p> {/* Use CSS Module */}
                                     {media.category && <p className={styles["file-category"]}>Category: {media.category}</p>} {/* Use CSS Module */}
                                     <p className={styles["upload-info"]}>Uploaded by {media.uploadedBy} on {new Date(media.uploadDate).toLocaleDateString()}</p> {/* Use CSS Module */}
                                     {media.caption && <p className={styles["file-caption"]}>{media.caption}</p>} {/* Use CSS Module */}
                                  </div>

                                  {/* Actions */}
                                  <div className={styles["media-actions"]}> {/* Use CSS Module */}
                                     {/* Optional: View/Download button */}
                                     {/* <a href={media.fileUrl} target="_blank" download={media.fileName} className="button-secondary">Download</a> */}
                                     {/* Delete Button */}
                                      <button
                                         className="button-secondary" // Reuse button style
                                         onClick={() => handleDeleteMedia(media.id, media.fileName)}
                                         disabled={loading} // Disable while deleting
                                      >
                                         Delete
                                      </button>
                                  </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                      <p className="no-events-message">No media files uploaded for this event yet.</p>
                 )}
             </div>


        </div>
    );
}