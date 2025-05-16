// src/app/events/create/page.tsx
'use client'; // Mark this component as a Client Component

import eventService from '@/services/eventService';
import { BudgetCategory, CreateEventData, EventBudget, CreateSessionData, Venue } from '@/types/event';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { FaTrash } from 'react-icons/fa';
import venueService from '@/services/venueService';
import eventBudgetService from '@/services/eventBudgetService';
import budgetCategoryService from '@/services/budgetCategoryService';
// import { useRouter } from 'next/navigation'; // Import if using router for navigation


// Helper function to create a new default session
const createDefaultSession = (): CreateSessionData => ({
    id: uuidv4(),
    sessionName: '',
    date: '',
    startTimeOnly: '',
    endTimeOnly: '',
    venueIds: [''], // Start with one empty venue selection field
    startDateTime: '', // Will be calculated later
    endDateTime: '',   // Will be calculated later
});




// --- The Component ---
export default function CreateEventPage() {
    const router = useRouter(); // Initialize router for navigation
    // const router = useRouter(); // Initialize router if needed for navigation
    const [formData, setFormData] = useState<CreateEventData>({
        name: '',
        description: '',
        organizerId: 1, // Replace with actual organizer ID logic

        participantsNo: '',
        sessions: [],
        eventBudgets: [],
    });

    const [recommendedVenues, setRecommendedVenues] = useState<Venue[]>([]);
    const [approvalFile, setApprovalFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);



    const [venues, setVenues] = useState<Venue[]>([]);
    const [venuesLoading, setVenuesLoading] = useState(true);
    // Correct way to initialize showAllVenues as an array of booleans
    const [showAllVenues, setShowAllVenues] = useState<boolean[]>([false]);

    // State variable to hold any error message if fetching fails
    const [venuesError, setVenuesError] = useState<string | null>(null);
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
    const [budgetCategoriesLoading, setBudgetCategoriesLoading] = useState(true);
    // State variable to hold any error message if fetching fails
    const [budgetCategoriesError, setBudgetCategoriesError] = useState<string | null>(null);

    const toggleShowAllVenues = (venueIndex: number) => {
        setShowAllVenues((prev) => {
            const updated = [...prev];
            updated[venueIndex] = !updated[venueIndex];
            return updated;
        });
    };

    useEffect(() => {
        console.log("Fetching venues...");
        // Define the asynchronous function that will perform the fetch
        const fetchVenues = async () => {
            console.log("Inside fetchVenues");
            // Set loading state to true before starting the fetch
            setVenuesLoading(true);
            // Clear any previous error messages
            setVenuesError(null);
            try {
                console.log("Calling venueService.fetchVenues()");
                // Call the service function to get venues from the backend API.
                // 'await' pauses execution until the Promise resolves with the fetched data.
                const fetchedVenues = await venueService.fetchVenues(); // Assumes eventService.getVenues() exists and works
                // Update the 'venues' state with the data received from the API

                console.log("Fetched venues:", fetchedVenues);
                setVenues(fetchedVenues);
            } catch (err: any) {
                // If an error occurs during the fetch, log it and set the error state
                console.error("Failed to fetch venues:", err);
                setVenuesError(`Failed to load venues: ${err.message || 'Unknown error'}`);
                // Optionally clear venues state on error if you don't want to show partial data
                // setVenues([]);
            } finally {
                // This block runs regardless of success or failure
                // Set loading state to false once the fetch is complete
                setVenuesLoading(false);
            }
        };

        const fetchBudgetCategories = async () => {
            console.log("Inside fetchBudgetCategories");
            // Set loading state to true before starting the fetch
            setBudgetCategoriesLoading(true);
            // Clear any previous error messages
            setBudgetCategoriesError(null);
            try {
                console.log("Calling budgetCategoryService.fetchVenues()");
                // Call the service function to get venues from the backend API.
                // 'await' pauses execution until the Promise resolves with the fetched data.
                const fetchBudgetCategories = await budgetCategoryService.fetchBudgetCategories(); // Assumes eventService.getVenues() exists and works
                // Update the 'venues' state with the data received from the API

                setBudgetCategories(fetchBudgetCategories);
            } catch (err: any) {
                // If an error occurs during the fetch, log it and set the error state
                console.error("Failed to fetch budget categories:", err);
                setBudgetCategoriesError(`Failed to load budget categories: ${err.message || 'Unknown error'}`);
                // Optionally clear venues state on error if you don't want to show partial data
                // setVenues([]);
            } finally {
                // This block runs regardless of success or failure
                // Set loading state to false once the fetch is complete
                setBudgetCategoriesLoading(false);
            }
        };




        // Call the fetch function immediately when the effect runs (on mount)
        fetchVenues();
        fetchBudgetCategories();



    }, []);

    // --- Initialize with one default session on client mount ---
    useEffect(() => {
        setFormData(prev => {
            // Only add the initial session if the sessions array is currently empty
            if (prev.sessions.length === 0) {
                console.log("Adding initial default session.");
                return {
                    ...prev,
                    sessions: [createDefaultSession()], // Use the helper function
                };
            }
            // If sessions array is not empty (e.g., after state reset, HMR), do nothing
            return prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    // --- FIX: Add initial session and budget item on the client side after mount ---
    useEffect(() => {
        // Check if eventVenues is empty (meaning this is the initial client render before adding)
        // Add the first session
        setFormData(prev => {
            // Only add if the array is currently empty
            if (prev.sessions.length === 0) {
                const initialVenues = [{
                    id: uuidv4(), // Generate UUID here, ensuring it runs only client-side
                    sessionName: '',
                    date: '',           // Include the date field
                    startTimeOnly: '',
                    endTimeOnly: '',
                    venueIds: [],
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

    useEffect(() => {
        const debounceTimeout = 300; // Adjust the delay as needed (e.g., 300ms to 1000ms)
        const timeoutId = setTimeout(async () => {
            if (typeof formData.participantsNo === 'number' && formData.participantsNo > 0) {
                const filtered = await venueService.fetchVenuesByCapacity(formData.participantsNo);
                setRecommendedVenues(filtered);
            } else {
                setRecommendedVenues([]);
            }
        }, debounceTimeout);

        return () => clearTimeout(timeoutId); // Cleanup to avoid memory leaks
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
            sessions: prev.sessions.map(session =>
                session.id === sessionId ? { ...session, [name]: value } : session
            ),
        }));
    };
    const handleAddSession = () => {
        setFormData(prev => ({
            ...prev,
            sessions: [
                ...prev.sessions,
                createDefaultSession(), // Use the helper function
            ],
        }));
    };

    const handleRemoveSession = (sessionId: string) => {
        if (formData.sessions.length <= 1) {
            alert("You must have at least one session.");
            setFormError("Each event must have at least one session."); // Optionally set form error
            return;
        }
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions.filter(session => session.id !== sessionId),
        }));
        setFormError(null);// Clear error if removal was successful

    };

    // --- Budget Handlers ---

    const handleBudgetChange = (budgetId: string, field: keyof EventBudget | 'categoryName', value: string) => {
        setFormData(prev => ({
            ...prev,
            eventBudgets: prev.eventBudgets.map(item => {
                if (item.id === budgetId) {
                    let processedValue: string | number | undefined = value;
                    let categoryName = item.budgetCategoryName;
                    let categoryId = item.budgetCategoryId;

                    if (field === 'amountAllocated') {
                        processedValue = value === '' ? '' : parseFloat(value) || 0;
                    } else if (field === 'categoryName') {
                        const selectedCategory = budgetCategories.find(cat => cat.name === value);
                        categoryId = selectedCategory?.id;
                        categoryName = value; // Store the name in state
                        processedValue = categoryName; // The value itself is the category name for this specific field update
                    }

                    // Dynamically create the updated object based on the field
                    const updatedItem = { ...item, [field]: processedValue };
                    // If the field was categoryName, also update budgetCategoryId and categoryName explicitly
                    if (field === 'categoryName') {
                        updatedItem.budgetCategoryId = categoryId;
                        updatedItem.budgetCategoryName = categoryName;
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
                    amountAllocated: 0,
                    amountSpent: 0,
                    budgetCategoryId: undefined,
                    budgetCategoryName: '',
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


    // Handler for changing a specific venue select within a session's venueIds array
    const handleVenueSelectChange = (sessionId: string, venueIndex: number, value: string) => {
        setFormData({
            ...formData,
            sessions: formData.sessions.map(session => {
                if (session.id === sessionId) {
                    const updatedVenueIds = [...(session.venueIds || [])];
                    updatedVenueIds[venueIndex] = value; // Update the specific venue ID at the given index
                    return { ...session, venueIds: updatedVenueIds };
                }
                return session;
            }),
        });
        setFormError(null);
    };

    // Handler to add a new empty venue select to a session's venueIds array
    const handleAddVenueToSession = (sessionId: string) => {
        setFormData({
            ...formData,
            sessions: formData.sessions.map(session => {
                if (session.id === sessionId) {
                    // Add an empty string to the venueIds array
                    return { ...session, venueIds: [...(session.venueIds || []), ''] };
                }
                return session;
            }),
        });
        setFormError(null);
    };

    // Handler to remove a specific venue select from a session's venueIds array by index
    const handleRemoveVenueFromSession = (sessionId: string, venueIndex: number) => {
        setFormData({
            ...formData,
            sessions: formData.sessions.map(session => {
                if (session.id === sessionId) {
                    // Filter out the venue ID at the given index
                    const updatedVenueIds = (session.venueIds ?? []).filter((_, index) => index !== venueIndex);
                    // Ensure there's always at least one venue select left if you don't want zero
                    if (updatedVenueIds.length === 0) {
                        return { ...session, venueIds: [''] }; // Add one empty select back
                    }
                    return { ...session, venueIds: updatedVenueIds };
                }
                return session;
            }),
        });
        setFormError(null);
    };


    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log("Enter handle submit");
        e.preventDefault();
        setIsLoading(true);
        setFormError(null);

        if (!formData.sessions || formData.sessions.length === 0) {
            setFormError("The event must have at least one session defined.");
            setIsLoading(false);
            return;
        }

        try {
            // *** MODIFIED: Process sessions to match backend SessionDTO structure ***
            const processedSessionsForBackend = formData.sessions.map((session) => {
                // Combine date and time strings
                session.startDateTime = `${session.date}T${session.startTimeOnly}`;
                session.endDateTime = `${session.date}T${session.endTimeOnly}`;

                // Validation
                if (!session.sessionName || session.sessionName.trim() === '') {
                    throw new Error(`Session Name is required for session (Client ID ${session.id}).`); // Use client ID for error clarity
                }
                if (!session.date || !session.startTimeOnly) {
                    throw new Error(`Start Date & Time is required for session "${session.sessionName}".`);
                }
                if (!session.endTimeOnly) {
                    throw new Error(`End Time is required for session "${session.sessionName}".`);
                }

                // Validate combined date/time (basic check)
                if (session.endDateTime <= session.startDateTime) {
                    throw new Error(`End time must be after start time for session "${session.sessionName}".`);
                }

                // Filter out empty/unselected venue IDs and parse them
                const validVenueIds = (session.venueIds || [])
                    .filter(vid => vid && vid.trim() !== '')
                    .map(vid => parseInt(vid, 10));

                if (validVenueIds.some(isNaN)) {
                    throw new Error(`Invalid Venue ID selected for Session "${session.sessionName}". Please ensure all selected venues are valid.`);
                }

                if (validVenueIds.length === 0) {
                    throw new Error(`At least one venue must be selected for session "${session.sessionName}".`);
                }


                // *** Prepare data for backend (SessionDTO structure) ***
                // The backend SessionDTO expects a List<Venue>. We send a list
                // of objects containing only the 'id' as that's what the backend
                // logic actually uses to link venues.
                const backendSessionData = {
                    sessionName: session.sessionName,
                    startDateTime: session.startDateTime, // Format: "YYYY-MM-DDTHH:mm"
                    endDateTime: session.endDateTime,     // Format: "YYYY-MM-DDTHH:mm"
                    // --- KEY CHANGE HERE ---
                    // Transform the array of venue IDs into an array of {id: number} objects
                    venues: validVenueIds.map(id => ({ id: id })),
                    // Note: The 'id' field from the frontend Session type (the UUID)
                    // is *not* sent to the backend, as the backend will generate its own ID.
                    // Similarly, qrCodeImage is generated backend-side if needed.
                };


                return backendSessionData;
            });


            // Process Budgets (Structure matches backend EventBudgetDTO)
            // Filter out budgets without a category or allocated amount
            const processedBudgets = formData.eventBudgets
                .filter(budget => budget.budgetCategoryId !== undefined && budget.budgetCategoryId !== null && budget.amountAllocated !== null && budget.amountAllocated !== undefined)
                .map((budget, index) => {
                    const amountAllocatedNum = Number(budget.amountAllocated);
                    if (isNaN(amountAllocatedNum) || amountAllocatedNum <= 0) { // Ensure positive allocation
                        throw new Error(`Invalid or non-positive allocated amount for Budget item ${index + 1} (${budget.budgetCategoryName || 'Unknown Category'}). Amount must be greater than 0.`);
                    }
                    if (budget.budgetCategoryId === undefined || budget.budgetCategoryId === null) { // Redundant check, but safe
                        throw new Error(`Budget category is missing for item ${index + 1}.`);
                    }
                    // Structure matches EventBudgetDTO: amountAllocated, amountSpent, budgetCategoryId
                    return {
                        amountAllocated: amountAllocatedNum,
                        amountSpent: budget.amountSpent || 0, // Default spent to 0 if not provided
                        budgetCategoryId: budget.budgetCategoryId,
                    };
                });


            // Basic Form Validation
            if (!formData.name || formData.name.trim() === '') {
                throw new Error("Event Title is required.");
            }
            if (formData.participantsNo === '' || Number(formData.participantsNo) <= 0) {
                throw new Error("Total Expected Participants must be a positive number.");
            }

            // Construct the final payload using FormData for potential file upload
            const apiFormData = new FormData();
            apiFormData.append('name', formData.name);
            if (formData.description) apiFormData.append('description', formData.description);
            apiFormData.append('organizerId', formData.organizerId.toString()); // Ensure it's a string
            apiFormData.append('participantsNo', formData.participantsNo.toString()); // Ensure it's a string

            // Append the correctly structured session and budget data as JSON strings
            apiFormData.append('sessions', JSON.stringify(processedSessionsForBackend));
            apiFormData.append('eventBudgets', JSON.stringify(processedBudgets));

            // Append the file if it exists
            if (approvalFile) {
                apiFormData.append('supportingDocument', approvalFile);
                console.log('Appending file:', approvalFile.name);
            } else {
                console.log('No supporting document file selected.');
                // Depending on backend requirements, you might need to explicitly send null
                // or an empty value if the document is optional but expected in the request.
                // Check your backend API specification. If it's truly optional and the
                // backend handles its absence, doing nothing here is fine.
            }

            console.log('Submitting FormData:', {
                name: apiFormData.get('name'),
                description: apiFormData.get('description'),
                organizerId: apiFormData.get('organizerId'),
                participantsNo: apiFormData.get('participantsNo'),
                sessions: apiFormData.get('sessions'), // Will show the stringified JSON
                eventBudgets: apiFormData.get('eventBudgets'), // Will show the stringified JSON
                supportingDocument: apiFormData.get('supportingDocument') ? (apiFormData.get('supportingDocument') as File).name : 'None'
            });
            console.log('Calling api.....');

            // API Call using the service
            const createdEvent = await eventService.createEventService(apiFormData);
            console.log('API Response:', createdEvent);

            // --- Success Handling ---
            const newEventId = createdEvent.id; // Assuming the response contains the new event's ID
            setSubmitSuccess("Event submitted for approval successfully!"); // Trigger success message/overlay
            console.log('Redirecting to /events/pending/', newEventId);
            router.push(`/events/pending/${newEventId}`); // Navigate to a relevant page

        } catch (error: any) {
            console.error("Submission Error:", error);
            // Provide more specific feedback if possible
            if (error.response && error.response.data && error.response.data.message) {
                // Error from backend API
                setFormError(`Submission Failed: ${error.response.data.message}`);
            } else if (error instanceof Error) {
                // Error generated during frontend processing (validation, etc.)
                setFormError(`Submission Failed: ${error.message}`);
            } else {
                // Generic fallback error
                setFormError("An unexpected error occurred during submission. Please check your input and try again.");
            }
        } finally {
            setIsLoading(false); // Ensure loading indicator is turned off
        }
    };


    const handleCancel = () => {
        // ... (keep existing cancel logic)
        console.log('Form cancelled');
        // Optionally add confirmation
        // Reset form state using the helper function for default session
        setFormData({
            name: '',
            description: '',
            organizerId: 1, // Reset to default or fetch dynamically
            participantsNo: '',
            sessions: [createDefaultSession()], // Reset with one default session
            eventBudgets: [], // Clear budgets
        });
        setApprovalFile(null);
        setRecommendedVenues([]);
        setFormError(null);
        setShowSuccessMessage(false); // Hide any success message
        setSubmitSuccess(null);
        // router.back(); // Optional: Navigate back
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
                        <h2>Budget</h2>
                        {/* Map over budget items to render each row */}
                        {formData.eventBudgets.map((item, index) => (
                            // This div wraps the category select, amount input, and remove button
                            // The CSS for .budget-item-controls makes these children display as a flex row
                            <div key={item.id} className="budget-item-controls">
                                {/* Category Select */}
                                {/* form-group-item helps manage flex growth within the row */}
                                <div className="form-group-item">
                                    {/* Use form-label-small for smaller labels if desired */}
                                    <label htmlFor={`budget-category-${item.id}`} className="form-label form-label-small">Category:</label>
                                    <select
                                        id={`budget-category-${item.id}`}
                                        name="categoryName" // Use categoryName to match handler
                                        value={item.budgetCategoryName} // Use categoryName from state
                                        onChange={(e) => handleBudgetChange(item.id, "categoryName", e.target.value)} // Pass categoryName
                                        className="form-input"
                                        required // Make category selection required
                                        disabled={isLoading}
                                    >
                                        <option value="">Select Category</option>
                                        {/* Map over your budget categories (mockBudgetCategories or fetched) */}
                                        {budgetCategories.map((cat) => (
                                            // Use category name as the value for the select option
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount Input */}
                                {/* form-group-item helps manage flex growth within the row */}
                                <div className="form-group-item">
                                    {/* Use form-label-small for smaller labels if desired */}
                                    <label htmlFor={`budget-amount-${item.id}`} className="form-label form-label-small">Allocated (MYR):</label>
                                    <input
                                        type="number"
                                        id={`budget-amount-${item.id}`}
                                        name="amountAllocated" // Use amountAllocated to match handler
                                        value={item.amountAllocated} // Use amountAllocated from state (string)
                                        onChange={(e) => handleBudgetChange(item.id, "amountAllocated", e.target.value)} // Pass amount string
                                        placeholder="e.g., 5000"
                                        className="form-input"
                                        min="0"
                                        step="0.01"
                                        required // Make amount required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Remove Budget Item Button */}
                                {/* Only show remove button if there's more than one budget item */}
                                {formData.eventBudgets.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveBudget(item.id)}
                                        className="button-remove-small" // Use the small remove button class
                                        disabled={isLoading}
                                        // Align button baseline with inputs using margin-top or margin-bottom
                                        style={{ flexShrink: 0, marginBottom: '5px' }} // Add margin-bottom to align with input baseline
                                    >
                                        {/* Use React-icons FaTrash */}
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Add Budget Row Button */}
                        <button
                            type="button"
                            onClick={addBudgetRow}
                            className="button-secondary" // Use secondary style for Add button
                            style={{ marginTop: '10px' }} // Add space above the button
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                            <h2>Event Sessions</h2> {/* Updated section title */}
                            {/* Button to Add More Session Blocks */}
                            <button
                                type="button"
                                onClick={handleAddSession}
                                className="button-secondary" // Use secondary style
                                disabled={isLoading} // Use isSubmitting state
                            >
                                + Add Session
                            </button>
                        </div>


                        {formData.sessions.map((session, index) => (
                            <div key={session.id} className="session-group"> {/* Use session-group class */}
                                <div className="session-header"> {/* Define session-header for layout */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h3>Session {index + 1}</h3>
                                        {formData.sessions.length > 1 && (
                                            <button
                                                className="delete-button"
                                                type="button"
                                                onClick={() => handleRemoveSession(session.id)}
                                                // className="button-remove-small" // Use specific small remove class
                                                disabled={isLoading}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
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


                                {/* Venue Selection(s) */}
                                <div className="form-group"> {/* Wrap venue selects in a form-group */}
                                    <label className="form-label">Venues:</label> {/* Label for the venue section */}

                                    {/* Map over the venueIds array to render multiple selects */}
                                    {((session.venueIds || [])).map((venueId, venueIndex) => (
                                        <div key={venueIndex} className="form-group-item form-group-inline" style={{ marginBottom: '10px' }}> {/* Use inline for select and remove button */}
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <select
                                                    id={`venue-${session.id}-${venueIndex}`}
                                                    name={`venue-${session.id}-${venueIndex}`}
                                                    value={venueId}
                                                    onChange={(e) => handleVenueSelectChange(session.id, venueIndex, e.target.value)}
                                                    required
                                                    className="form-input"
                                                    style={{ flexGrow: 1 }}
                                                >
                                                    <option value="">Select a Venue ({showAllVenues[venueIndex] ? 'All' : 'Recommended'})</option>
                                                    {showAllVenues[venueIndex] ? venues.map((venue) => (
                                                        <option key={venue.id} value={String(venue.id)}>
                                                            {venue.name} (Capacity: {venue.capacity})
                                                        </option>
                                                    )):
                                                    recommendedVenues.map((venue) => (
                                                        <option key={venue.id} value={String(venue.id)}>
                                                            {venue.name} (Capacity: {venue.capacity})
                                                        </option>
                                                    ))
                                                    }
                                                </select>
                                                <div className="flex items-center gap-2 mb-2" style={{ flexShrink: 0 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={showAllVenues[venueIndex] ?? false}
                                                        onChange={() => toggleShowAllVenues(venueIndex)}
                                                        disabled={isLoading || venues.length === 0}
                                                    />
                                                    <label>Show all venues</label>
                                                </div>
                                                {/* Remove button for this specific venue select */}
                                                {(session.venueIds || []).length > 1 && ( // Only show remove if there's more than one venue select
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveVenueFromSession(session.id, venueIndex)} // Use specific handler
                                                        className="delete-button" // Use a secondary button style
                                                        disabled={isLoading}
                                                        style={{ flexShrink: 0 }} // Prevent button from shrinking
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Venue Button (below the list of venue selects) */}
                                    <button
                                        type="button"
                                        onClick={() => handleAddVenueToSession(session.id)} // Use specific handler
                                        className="button-secondary"
                                        style={{ marginTop: '5px' }} // Add space above the button
                                        disabled={isLoading || venues.length === 0} // Disable if no venues to add
                                    >
                                        + Add Venue for this Session
                                    </button>

                                    {/* {venuesLoading && <p className="loading-message" style={{ marginTop: '5px' }}>Loading venues...</p>}
                                    {venuesError && <p className="error-message" style={{ marginTop: '5px' }}>{venuesError}</p>}
                                    {!venuesLoading && !venuesError && venues.length === 0 && (
                                        <p className="info-message" style={{ marginTop: '5px' }}>No venues available to add.</p>
                                    )} */}
                                </div>


                            </div>

                        )
                        )}
                    </div>
                    {/* --- Action Buttons --- */}
                    < div className="form-actions" >
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