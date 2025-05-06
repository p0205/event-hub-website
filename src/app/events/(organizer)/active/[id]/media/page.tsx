// src/app/events/[id]/media/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import styles from './media.module.css'; // Create this CSS module
import eventMediaService from '@/services/eventMediaService';
import { EventMedia } from '@/types/event';
import { formatDate } from '@/helpers/eventHelpers';


export default function EventMediaPage() {
    const params = useParams();
    const eventId = Number(params.id);

    // --- State for data and loading ---
    const [mediaFiles, setMediaFiles] = useState<EventMedia[]>([]);// State to hold uploaded media files
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for upload process ---

    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null); // Files selected by user
    const [uploading, setUploading] = useState(false); // State for upload loading
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    // Optional: State for a single caption applied to all selected files (if multi-upload) or a way to add caption per file

    const [trigger, setTrigger] = useState(0);

    // --- Data Loading (using Mock Data for initial media list) ---
    useEffect(() => {
        const loadMockMedia = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate data loading delay (optional)

                const data = await eventMediaService.getEventMedia(eventId);
                // Use mock data directly for the initial media list
                setMediaFiles(data);

            } catch (e: any) {
                console.error("Error loading mock media data:", e);
                setError(`Failed to load mock media data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockMedia();

    }, [eventId, trigger]); // Rerun if eventId changes



    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files);
        setUploadError(null); // Clear previous errors
        setUploadSuccess(null); // Clear previous success messages
        // Reset category if needed, or default to first
        // Optional: Reset caption state
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
            formData.append('files', selectedFiles[i]); // Append files
        }

        try {

            eventMediaService.addEventMedia(formData, eventId);

            setTrigger(prev => prev + 1);


            // setMediaFiles(prevMedia => [...prevMedia, ...uploadedFileDetails]); // Add new files to the list
            setUploadSuccess(`${selectedFiles.length} file(s) uploaded successfully!`); // Show success message
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

                    {/* Upload Button */}
                    {selectedFiles && selectedFiles.length > 0 && (
                        <button
                            className="button-primary" // Reuse button style
                            onClick={handleUploadFiles}
                            disabled={!selectedFiles || selectedFiles.length === 0 || uploading} // Disable if no files, uploading, or no category selected
                            style={{ marginTop: '20px' }} // Add space above button
                        >
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </button>
)}

                    {/* Upload Feedback */}
                    {uploading && <p className="loading-message" style={{ marginTop: '10px' }}>Uploading...</p>}
                    {uploadError && <p className="error-message" style={{ marginTop: '10px' }}>{uploadError}</p>}
                    {uploadSuccess && <p className="loading-message" style={{ marginTop: '10px' }}>{uploadSuccess}</p>} {/* Using loading style for success */}
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
                                {
                                    //   media.fileType.startsWith('image/') ? (
                                    <img
                                        src={media.fileUrl}
                                        alt={media.filename}
                                        className={styles["media-image"]} // Use CSS Module
                                    // Optional: Add onClick to view larger
                                    // onClick={() => handleViewMedia(media)}
                                    />
                                    //   )
                                    //    : (
                                    //       // Handle other file types if necessary
                                    //       <div className={styles["file-icon"]}>File ({media.fileType})</div>
                                    //   )
                                }

                                {/* Media details */}
                                <div className={styles["media-details"]}> {/* Use CSS Module */}
                                    <p className={styles["file-name"]}>{media.filename}</p> {/* Use CSS Module */}
                                    {/* {media.category && <p className={styles["file-category"]}>Category: {media.category}</p>} Use CSS Module */}
                                    <p className={styles["upload-info"]}>Uploaded on {formatDate(media.uploadedAt)}</p> {/* Use CSS Module */}
                                    {/* {media.caption && <p className={styles["file-caption"]}>{media.caption}</p>} Use CSS Module */}
                                </div>

                                {/* Actions */}
                                <div className={styles["media-actions"]}> {/* Use CSS Module */}
                                    {/* Optional: View/Download button */}
                                    {/* <a href={media.fileUrl} target="_blank" download={media.fileName} className="button-secondary">Download</a> */}
                                    {/* Delete Button */}
                                    <button
                                        className="button-secondary" // Reuse button style
                                        onClick={() => handleDeleteMedia(media.id, media.filename)}
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