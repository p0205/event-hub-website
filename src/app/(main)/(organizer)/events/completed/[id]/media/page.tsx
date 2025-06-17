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