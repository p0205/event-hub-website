// src/app/events/create/page.tsx
'use client'; // Mark this component as a Client Component

import  eventService  from '@/services/eventService';
import { CreateEventData, EventBudget } from '@/types/event';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
// import { useRouter } from 'next/navigation'; // Import if using router for navigation



// --- Mock Data (Replace with API calls) ---
interface Venue {
    id: number;
    name: string;
    capacity: number;
}

interface BudgetCategory {
    id: number;
    name: string;
}

const mockVenues: Venue[] = [
    { id: 1, name: 'Makmal Eksekutif', capacity: 41 },
    { id: 2, name: 'Makmal Fiber Optik', capacity: 30 },
    { id: 3, name: 'MKP1', capacity: 36 },
    { id: 4, name: 'MKP2', capacity: 36 },
    { id: 5, name: 'MKP3', capacity: 37 },
];

const mockBudgetCategories: BudgetCategory[] = [
    { id: 1, name: 'Transportation' },
    { id: 2, name: 'Catering' },
];

// --- The Component ---
export default function CreateEventPage() {
    const router = useRouter(); // Initialize router for navigation
    // const router = useRouter(); // Initialize router if needed for navigation
    const [formData, setFormData] = useState<CreateEventData>({
        name: '',
        description: '',
        organizerId: 1, // Replace with actual organizer ID logic
        startDateTime: '',
        endDateTime: '',
        participantsNo: '',
        eventVenues: [],
        eventBudgets: [],
    });

    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    // --- FIX: Add initial session and budget item on the client side after mount ---
    useEffect(() => {
        // Check if eventVenues is empty (meaning this is the initial client render before adding)
        // Add the first session
        setFormData(prev => {
            // Only add if the array is currently empty
            if (prev.eventVenues.length === 0) {
                const initialVenues = [{
                    id: uuidv4(), // Generate UUID here, ensuring it runs only client-side
                    sessionName: '',
                    date: '',           // Include the date field
                    startTimeOnly: '',
                    endTimeOnly: '',
                    venueId: '',
                    startDateTime: '', // These will be calculated on submit
                    endDateTime: '',   // These will be calculated on submit
                }];

                // Add the first budget item if needed initially (optional)
                // If you want an initial budget row, uncomment this and add similar logic
                // const initialBudgets = [{
                //     id: uuidv4(), // Generate UUID here on client
                //     amountAllocated: '',
                //     amountSpent: 0,
                //     budgetCategoryId: undefined,
                //     categoryName: '',
                // }];

                return {
                    ...prev,
                    eventVenues: initialVenues,
                    // eventBudgets: initialBudgets, // Uncomment if adding initial budget row
                };
            }
            return prev; // If not empty, do nothing (e.g., after a state reset)
        });

    }, []);

    const [recommendedVenues, setRecommendedVenues] = useState<Venue[]>([]);
    const [approvalFile, setApprovalFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof formData.participantsNo === 'number' && formData.participantsNo > 0) {
            const filtered = mockVenues.filter(venue => venue.capacity >= (formData.participantsNo as number));
            setRecommendedVenues(filtered);
        } else {
            setRecommendedVenues([]);
        }
    }, [formData.participantsNo]);


    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (submitSuccess) {
            setShowSuccessMessage(true); // Show the overlay when submitSuccess is set
            // Set a timer to hide the overlay after 5 seconds (adjust as needed)
            timer = setTimeout(() => {
                setShowSuccessMessage(false);
                setSubmitSuccess(null); // Optionally clear the message after hiding
            }, 3000); //3 seconds
        }

        // Cleanup function: clear the timer if the component unmounts or submitSuccess changes before the timer fires
        return () => clearTimeout(timer);
    }, [submitSuccess]); // Re-run this effect whenever submitSuccess changes



    // --- Event Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            participantsNo: value === '' ? '' : parseInt(value, 10) || 0,
        }));
    };

    // --- Session Handlers ---

    const handleSessionInputChange = (sessionId: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            eventVenues: prev.eventVenues.map(session =>
                session.id === sessionId ? { ...session, [name]: value } : session
            ),
        }));
    };

    const handleAddSession = () => {
        setFormData(prev => ({
            ...prev,
            eventVenues: [
                ...prev.eventVenues,
                {
                    id: uuidv4(),
                    sessionName: '',
                    date: '',
                    startTimeOnly: '',
                    endTimeOnly: '',
                    venueId: '',
                    startDateTime: '',
                    endDateTime: '',
                },
            ],
        }));
    };

    const handleRemoveSession = (sessionId: string) => {
        if (formData.eventVenues.length <= 1) {
            alert("You must have at least one session.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            eventVenues: prev.eventVenues.filter(session => session.id !== sessionId),
        }));
    };

    // --- Budget Handlers ---

    const handleBudgetChange = (budgetId: string, field: keyof EventBudget | 'categoryName', value: string) => {
        setFormData(prev => ({
            ...prev,
            eventBudgets: prev.eventBudgets.map(item => {
                if (item.id === budgetId) {
                    let processedValue: string | number | undefined = value;
                    let categoryName = item.categoryName;
                    let categoryId = item.budgetCategoryId;

                    if (field === 'amountAllocated') {
                        processedValue = value === '' ? '' : parseFloat(value) || 0;
                    } else if (field === 'categoryName') {
                        const selectedCategory = mockBudgetCategories.find(cat => cat.name === value);
                        categoryId = selectedCategory?.id;
                        categoryName = value; // Store the name in state
                        processedValue = categoryName; // The value itself is the category name for this specific field update
                    }

                    // Dynamically create the updated object based on the field
                    const updatedItem = { ...item, [field]: processedValue };
                    // If the field was categoryName, also update budgetCategoryId and categoryName explicitly
                    if (field === 'categoryName') {
                        updatedItem.budgetCategoryId = categoryId;
                        updatedItem.categoryName = categoryName;
                    }

                    return updatedItem;
                }
                return item;
            }),
        }));
    };


    const addBudgetRow = () => {
        setFormData(prev => ({
            ...prev,
            eventBudgets: [
                ...prev.eventBudgets,
                {
                    id: uuidv4(),
                    amountAllocated: '',
                    amountSpent: 0,
                    budgetCategoryId: undefined,
                    categoryName: '',
                },
            ],
        }));
    };

    const handleRemoveBudget = (budgetId: string) => {
        setFormData(prev => ({
            ...prev,
            eventBudgets: prev.eventBudgets.filter(budget => budget.id !== budgetId),
        }));
    };

    // --- File Handler ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setApprovalFile(file);
                setFormData(prev => ({ ...prev, supportingDocument: file }));
            } else {
                alert("Please upload a PDF file only.");
                e.target.value = '';
                setApprovalFile(null);
                setFormData(prev => ({ ...prev, supportingDocument: undefined }));
            }
        } else {
            setApprovalFile(null);
            setFormData(prev => ({ ...prev, supportingDocument: undefined }));
        }
    };

    // --- Form Submission ---

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        console.log("Enter handle submit");
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);

        try {
            // **Data Transformation & Validation (Crucial Step)**
            let overallStartTime = '';
            let overallEndTime = '';

            const processedSessions = formData.eventVenues.map((session, index) => {
                if (!session.date || !session.startTimeOnly || !session.venueId || !session.sessionName) {
                    throw new Error(`Please fill in all details for Session ${index + 1} (Name, Date, Start Time, Venue).`);
                }

                const startDateTime = `${session.date}T${session.startTimeOnly}`;
                const endDateTime = session.endTimeOnly ? `${session.date}T${session.endTimeOnly}` : undefined;

                if (endDateTime && startDateTime >= endDateTime) {
                    throw new Error(`End time must be after start time for Session ${index + 1}.`);
                }

                if (!overallStartTime || startDateTime < overallStartTime) {
                    overallStartTime = startDateTime;
                }
                const effectiveEndTime = endDateTime || startDateTime; // Use start time if end time is missing for comparison
                if (!overallEndTime || effectiveEndTime > overallEndTime) {
                    overallEndTime = effectiveEndTime;
                }


                return {
                    // id: session.id, // Usually don't send UI id to backend
                    sessionName: session.sessionName,
                    startDateTime: startDateTime, // Send combined datetime
                    endDateTime: endDateTime,     // Send combined datetime
                    venueId: session.venueId,
                };
            });

            const processedBudgets = formData.eventBudgets.map((budget, index) => {
                if (!budget.budgetCategoryId || budget.amountAllocated === '') {
                    throw new Error(`Please select a category and enter an allocated amount for Budget item ${index + 1}.`);
                }
                if (Number(budget.amountAllocated) < 0) {
                    throw new Error(`Allocated amount cannot be negative for Budget item ${index + 1}.`);
                }
                return {
                    amountAllocated: Number(budget.amountAllocated),
                    amountSpent: budget.amountSpent,
                    budgetCategoryId: budget.budgetCategoryId,
                }
            });

            if (!formData.name) {
                throw new Error("Event Title is required.");
            }
            if (formData.participantsNo === '') {
                throw new Error("Total Expected Participants is required.");
            }

            // Construct the final payload for the API
            const finalData: Omit<CreateEventData, 'supportingDocument' | 'eventBudgets' | 'eventVenues'> & { eventBudgets: typeof processedBudgets; eventVenues: typeof processedSessions } = {
                name: formData.name,
                description: formData.description,
                organizerId: formData.organizerId,
                startDateTime: overallStartTime,
                endDateTime: overallEndTime,
                participantsNo: Number(formData.participantsNo),
                eventVenues: processedSessions,
                eventBudgets: processedBudgets,
            };

            console.log('Submitting data (excluding file):', finalData);

            // --- Replace with your actual API call using FormData for file upload ---
            const apiFormData = new FormData();
            apiFormData.append('name', finalData.name);
            apiFormData.append('description', finalData.description);
            apiFormData.append('organizerId', finalData.organizerId.toString());
            apiFormData.append('startDateTime', finalData.startDateTime);
            apiFormData.append('endDateTime', finalData.endDateTime);
            apiFormData.append('participantsNo', finalData.participantsNo.toString());
            apiFormData.append('eventVenues', JSON.stringify(finalData.eventVenues));
            apiFormData.append('eventBudgets', JSON.stringify(finalData.eventBudgets));
            if (approvalFile) {
                apiFormData.append('supportingDocument', approvalFile);
                console.log('Appending file:', approvalFile.name);
            } else {
                console.log('No supporting document file selected.');
            }

            console.log('Calling api.....');
            // Example API call structure:
            const createdEvent = await eventService.createEventService(apiFormData);
            console.log('API Response:', createdEvent);

            // const newEventName = createdEvent.name; // <-- Accesses properties of the response object
            const newEventId = createdEvent.id; // <-- Accesses properties of the response object
           
            setSubmitSuccess("Event submitted for approval successfully!"); // <-- Updates state based on success
            console.log('/events/pending/${newEventId}, ',newEventId);
            router.push(`/events/pending/${newEventId}`); // <-- Redirects based on success data

            // // Mock Success:
            // await new Promise(resolve => setTimeout(resolve, 1500));
            // console.log('Form Submitted Successfully (Simulated)');
            // alert('Event submitted for approval!');
            // router.push('/events'); // Navigate on success

        } catch (error: any) {
            console.error("Submission Error:", error);
            setFormError(error.message || "An unexpected error occurred during submission.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        console.log('Form cancelled');
        // Optionally add confirmation
        // Reset form state:
        setFormData({
            name: '', description: '', organizerId: 1, startDateTime: '', endDateTime: '',
            participantsNo: '',
            eventVenues: [{ id: uuidv4(), sessionName: '', date: '', startTimeOnly: '', endTimeOnly: '', venueId: '', startDateTime: '', endDateTime: '' }],
            eventBudgets: [],
        });
        setApprovalFile(null);
        setRecommendedVenues([]);
        setFormError(null);
        // router.back(); // Navigate back
    };


    // --- Render JSX ---
    return (
        // Using class names from globals.css
        <div className="page-container">
            <h1>Create New Event</h1>

            <div className="form-container">
                <form onSubmit={handleSubmit}>

                    {formError && <p className="error-message">{formError}</p>} {/* Use error-message class */}

                    {/* --- Event Details Section --- */}
                    <div className="form-section">
                        <h2>Event Details</h2>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Event Title:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="participantsNo" className="form-label">Total Expected Participants:</label>
                            <input
                                type="number"
                                id="participantsNo"
                                name="participantsNo"
                                value={formData.participantsNo}
                                onChange={handleMaxParticipantsChange}
                                min="1"
                                required
                                className="form-input"
                                placeholder="e.g., 150"
                            />
                            {/* Display Recommended Venues */}
                            {recommendedVenues.length > 0 && formData.participantsNo !== '' && (
                                <div className="recommended-venues"> {/* Use existing class */}
                                    <p className="form-label">Recommended Venues (Capacity {'>='} {formData.participantsNo}):</p>
                                    <ul>
                                        {recommendedVenues.map(venue => (
                                            <li key={venue.id}>
                                                {venue.name} (Capacity: {venue.capacity})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {recommendedVenues.length === 0 && typeof formData.participantsNo === 'number' && formData.participantsNo > 0 && (
                                <div className="recommended-venues no-recommendations-message"> {/* Add specific class for styling 'not found' */}
                                    <p className="form-label">No venues found with capacity {'>='} {formData.participantsNo}.</p>
                                </div>
                            )}
                        </div>


                    </div>


                    {/* --- Budget Section --- */}
                    <div className="form-section">
                        <h2>Budget Allocation</h2>
                        {formData.eventBudgets.map((item, index) => (
                            // Using flex utilities for layout might be better if using Tailwind
                            // Otherwise, define .budget-item-controls
                            <div key={item.id} className="budget-item-controls">
                                <div className="form-group-item"> {/* Assuming .form-group-item handles flex growth */}
                                    <label className="form-label form-label-small">Category:</label> {/* Add form-label-small */}
                                    <select
                                        name="categoryName"
                                        value={item.categoryName}
                                        onChange={(e) => handleBudgetChange(item.id, "categoryName", e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {mockBudgetCategories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group-item"> {/* Assuming .form-group-item handles flex growth */}
                                    <label className="form-label form-label-small">Allocated (MYR):</label> {/* Add form-label-small */}
                                    <input
                                        type="number"
                                        name="amountAllocated"
                                        value={item.amountAllocated}
                                        onChange={(e) => handleBudgetChange(item.id, "amountAllocated", e.target.value)}
                                        placeholder="e.g., 5000"
                                        className="form-input"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveBudget(item.id)}
                                    className="button-remove" // Use specific remove class
                                    disabled={isLoading}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addBudgetRow}
                            className="button-secondary" // Use secondary style for Add button
                            disabled={isLoading}
                        >
                            + Add Budget Item
                        </button>
                    </div>


                    {/* --- File Upload Section --- */}
                    <div className="form-section">
                        <h2>Supporting Document</h2>
                        <div className="form-group">
                            <label htmlFor="approvalFile" className="form-label">Upload Approval File (PDF only):</label>
                            <input
                                type="file"
                                id="approvalFile"
                                name="supportingDocument" // Name should match the key in FormData
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="form-input"
                                disabled={isLoading}
                            />
                            {approvalFile && (
                                <p className="file-info">Selected: {approvalFile.name}</p>
                            )}
                        </div>
                    </div>


                    {/* --- Sessions Section (Venue & Time) --- */}
                    <div className="form-section">
                        <h2>Event Sessions (Venue & Time Slots)</h2>

                        {formData.eventVenues.map((session, index) => (
                            <div key={session.id} className="session-group"> {/* Use session-group class */}
                                <div className="session-header"> {/* Define session-header for layout */}
                                    <h3>Session {index + 1}</h3>
                                    {formData.eventVenues.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSession(session.id)}
                                            className="button-remove-small" // Use specific small remove class
                                            disabled={isLoading}
                                        >
                                            Remove Session
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor={`sessionName-${session.id}`} className="form-label">Session Name:</label>
                                    <input
                                        type="text"
                                        id={`sessionName-${session.id}`}
                                        name="sessionName"
                                        value={session.sessionName}
                                        onChange={(e) => handleSessionInputChange(session.id, e)}
                                        required
                                        className="form-input"
                                        placeholder="e.g., Keynote Address, Workshop A, Lunch Break"
                                    />
                                </div>

                                {/* Inline group for date/time */}
                                <div className="form-group-inline">
                                    <div className="form-group-item">
                                        <label htmlFor={`date-${session.id}`} className="form-label">Date:</label>
                                        <input
                                            type="date"
                                            id={`date-${session.id}`}
                                            name="date"
                                            value={session.date}
                                            onChange={(e) => handleSessionInputChange(session.id, e)}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group-item">
                                        <label htmlFor={`startTimeOnly-${session.id}`} className="form-label">Start Time:</label>
                                        <input
                                            type="time"
                                            id={`startTimeOnly-${session.id}`}
                                            name="startTimeOnly"
                                            value={session.startTimeOnly}
                                            onChange={(e) => handleSessionInputChange(session.id, e)}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group-item">
                                        <label htmlFor={`endTimeOnly-${session.id}`} className="form-label">End Time:</label>
                                        <input
                                            type="time"
                                            id={`endTimeOnly-${session.id}`}
                                            name="endTimeOnly"
                                            value={session.endTimeOnly}
                                            onChange={(e) => handleSessionInputChange(session.id, e)}
                                            className="form-input"
                                        />
                                    </div>
                                </div> {/* End Inline Group */}

                                <div className="form-group">
                                    <label htmlFor={`venue-${session.id}`} className="form-label">Venue:</label>
                                    <select
                                        id={`venue-${session.id}`}
                                        name="venueId"
                                        value={session.venueId}
                                        onChange={(e) => handleSessionInputChange(session.id, e)}
                                        required
                                        className="form-input"
                                    >
                                        <option value="">Select a Venue</option>
                                        {mockVenues.map(venue => (
                                            <option key={venue.id} value={venue.id}>
                                                {venue.name} (Capacity: {venue.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div> // End session-group
                        ))}

                        {/* Button to Add More Sessions */}
                        <button
                            type="button"
                            onClick={handleAddSession}
                            className="button-secondary" // Use secondary style
                            disabled={isLoading}
                        >
                            + Add Another Session
                        </button>

                    </div> {/* End Sessions Section */}


                    {/* --- Action Buttons --- */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="button-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>


                {showSuccessMessage && submitSuccess && (
                    <div className="success-overlay">
                        {/* The green arrow element */}
                        <div className="success-overlay-arrow"></div>
                        {/* The success message content */}
                        <div className="success-overlay-content">
                            <span className="success-overlay-message">{submitSuccess}</span>
                            {/* Optional close button */}
                            {/* <button className="success-overlay-close" onClick={handleCloseSuccessOverlay}>&times;</button> */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}