// src/app/events/[id]/media/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import styles from './media.module.css'; // Create this CSS module
import eventMediaService from '@/services/eventMediaService';
import { EventMedia } from '@/types/event';
import { formatDate } from '@/helpers/eventHelpers';
import { Upload, Loader2, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { toast } from 'sonner';


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

    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [trigger, setTrigger] = useState(0);

    const [previewMedia, setPreviewMedia] = useState<EventMedia | null>(null); // selected media to preview
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);


    // --- Data Loading  ---
    useEffect(() => {
        console.log("Fetch media.....");
        const loadMedia = async () => {
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

        loadMedia();

    }, [eventId, trigger]); // Rerun if eventId changes


    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const filesArray = Array.from(files);

        setSelectedFiles(files);
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

            await eventMediaService.addEventMedia(formData, eventId);

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
    const handleDeleteMedia = async (mediaId: number, fileName: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this media?");
        if (!confirmDelete) return;

        console.log(`Deleting media file ${fileName} (ID: ${mediaId}) from event ${eventId}`);

        setLoading(true); // Show overall loading while deleting (can use separate state if preferred)
        setError(null); // Clear previous errors

        try {
            await eventMediaService.deleteEventMedia(mediaId, eventId);

            setTrigger(prev => prev + 1);
            setLoading(false);
            setDeleteSuccess(true);
            toast.success("Deleted successfully");
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
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Media</h2>
                        <p className={'page-subtitle'}>
                            Upload and manage event media
                        </p>
                    </div>

                </div>
                <p className="loading-message">Loading media files...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Media</h2>
                        <p className={'page-subtitle'}>
                            Upload and manage event media
                        </p>
                    </div>

                </div>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    const hasMediaFiles = mediaFiles && mediaFiles.length > 0;


    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <div className='page-header'>
                <div className='page-title-section'>
                    <h2>Media</h2>
                    <p className={'page-subtitle'}>
                        Upload and manage event media
                    </p>
                </div>

            </div>
            {/* --- Upload Media Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Upload Media Files</h2>

                <div
                    className={clsx(
                        "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors",
                        dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                    )}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-gray-600">Click or drag files here to upload</p>
                    <p className="text-sm text-gray-400">Supported: PNG, JPG, PDF, JPEG</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".png,.pdf,.jpg,.jpeg"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                    />
                </div>

                {/* Display selected file names */}
                {selectedFiles && selectedFiles.length > 0 && (
                    <span style={{ marginLeft: '10px' }}>
                        {selectedFiles.length} file(s) selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                    </span>
                )}


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


                {/* Uploading Indicator */}
                {uploading && (
                    <div className="mt-4 text-blue-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading file(s)...
                    </div>
                )}

                {/* Success Message */}
                {uploadSuccess && (
                    <div className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-md flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Uploaded successfully!
                    </div>
                )}

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
                                        onClick={() => setPreviewMedia(media)} // Show modal on click
                                        style={{ cursor: 'pointer' }}
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

            {previewMedia && (
                <div className={styles["modal-overlay"]} onClick={() => setPreviewMedia(null)}>
                    <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
                        <button className={styles["close-button"]} onClick={() => setPreviewMedia(null)}>
                            &times;
                        </button>
                        <img src={previewMedia.fileUrl} alt={previewMedia.filename} className={styles["modal-image"]} />

                    </div>
                </div>
            )}


        </div>
    );
}