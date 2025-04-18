// src/app/create-event/page.tsx
'use client'; // Mark as Client Component

import React, { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for unique session IDs

// Define interfaces for the data structures
interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface Session {
  id: string; // Unique ID for managing the session in the UI
  date: string;
  startTime: string;
  endTime: string;
  venueId: string; // ID of the selected venue for this session
}

interface EventFormData {
  title: string;
  description: string;
  sessions: Session[]; // Array of event sessions
  maxParticipants: number | ''; // Use number or empty string
  visibility: 'public' | 'private' | 'unlisted';
  // status will be set by the backend (e.g., 'pending_approval')
}

// --- MOCK VENUE DATA ---
// In a real application, you would fetch this from your backend API
const mockVenues: Venue[] = [
  { id: 'venue-a', name: 'Grand Hall', capacity: 500 },
  { id: 'venue-b', name: 'Conference Room 1', capacity: 50 },
  { id: 'venue-c', name: 'Auditorium', capacity: 200 },
  { id: 'venue-d', name: 'Meeting Room 3', capacity: 25 },
  { id: 'venue-e', name: 'Ballroom', capacity: 1000 },
];
// -----------------------
const budgetCategories = [
  "Catering",
  "Venue Rental",
  "Equipment",
  "Decoration",
  "Transportation",
  "Others"
];


export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    sessions: [{ id: uuidv4(), date: '', startTime: '', endTime: '', venueId: '' }], // Initialize with one session
    maxParticipants: '',
    visibility: 'public',
  });

  const [budgets, setBudgets] = useState([{ category: "", amount: "" }]);
  const [approvalFile, setApprovalFile] = useState<File | null>(null);

  // State to hold venues recommended by capacity
  const [recommendedVenues, setRecommendedVenues] = useState<Venue[]>([]);

  // --- Handlers for Main Event Data ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Cast for checkbox

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handler for Maximum Participants input, triggers venue recommendation
  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const participants = value === '' ? '' : Number(value);

    setFormData({
      ...formData,
      maxParticipants: participants,
    });

    // Recommend venues based on entered participant number
    if (typeof participants === 'number' && participants > 0) {
      const suitableVenues = mockVenues.filter(venue => venue.capacity >= participants);
      setRecommendedVenues(suitableVenues);
    } else {
      setRecommendedVenues([]); // Clear recommendations if input is invalid or empty
    }
  };

  // --- Handlers for Budget
    const handleBudgetChange = (index: number, field: string, value: string) => {
      const updated = [...budgets];
      updated[index][field as keyof typeof updated[0]] = value;
      setBudgets(updated);
    };

    const addBudgetRow = () => {
      setBudgets([...budgets, { category: "", amount: "" }]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setApprovalFile(e.target.files[0]);
      }
    };

  // --- Handlers for Sessions Array ---
  const handleAddSession = () => {
    setFormData({
      ...formData,
      sessions: [...formData.sessions, { id: uuidv4(), date: '', startTime: '', endTime: '', venueId: '' }],
    });
  };

  const handleRemoveSession = (id: string) => {
    setFormData({
      ...formData,
      sessions: formData.sessions.filter(session => session.id !== id),
    });
  };

  const handleSessionInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      sessions: formData.sessions.map(session =>
        session.id === id ? { ...session, [name]: value } : session
      ),
    });
  };

  // --- Form Submission ---
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    console.log('Event data submitted for approval:', formData);

    // TODO: Add logic here to send formData to your backend API for approval
    // The backend should set the status to 'pending_approval' or similar.
    // Example:
    // fetch('/api/events/submit-for-approval', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData),
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Submission Success:', data);
    //   // Redirect to a "pending approval" page or show success message
    // })
    // .catch((error) => {
    //   console.error('Submission Error:', error);
    //   // Show error message to the user
    // });

    // Optionally reset form or navigate away after submission
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    // TODO: Add logic to navigate back, e.g., using Next.js router
    // router.push('/dashboard'); // Example using useRouter
  };

  return (
    <div className="page-container">
      <h1>Create New Event</h1>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Event Details */}
          <div className="form-section">
            <h2>Event Details</h2>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Event Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
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

            {/* Max Participants & Venue Recommendation */}
             <div className="form-group">
                <label htmlFor="maxParticipants" className="form-label">Total Expected Participants:</label>
                <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleMaxParticipantsChange} // Use specific handler
                    min="1"
                    className="form-input"
                />
                {/* Display Recommended Venues */}
                {recommendedVenues.length > 0 && (
                    <div className="recommended-venues">
                        <p className="form-label">Recommended Venues (Capacity {'>='} {formData.maxParticipants}):</p>
                        <ul>
                            {recommendedVenues.map(venue => (
                                <li key={venue.id}>
                                    {venue.name} (Capacity: {venue.capacity})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {recommendedVenues.length === 0 && typeof formData.maxParticipants === 'number' && formData.maxParticipants > 0 && (
                     <div className="recommended-venues">
                        <p className="form-label">No venues found with capacity {'>='} {formData.maxParticipants}.</p>
                     </div>
                 )}
            </div>

             {/* Visibility */}
             <div className="form-group">
                <label htmlFor="visibility" className="form-label">Visibility:</label>
                <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="form-input"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                </select>
            </div>

            



{/* Budget Section */}
      <div className="mb-6">
        <label className="form-label">Budget Allocation</label>

        {budgets.map((item, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <select
              value={item.category}
              onChange={(e) => handleBudgetChange(index, "category", e.target.value)}
              className="border px-3 py-1 rounded w-1/2"
            >
              <option value="">Select Category</option>
              {budgetCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.amount}
              onChange={(e) => handleBudgetChange(index, "amount", e.target.value)}
              placeholder="Allocated Amount (MYR)"
              className="border px-3 py-1 rounded w-1/2"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addBudgetRow}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add another category
        </button>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="form-label">Upload Approval File (PDF only)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="border rounded px-3 py-2 w-full"
        />
        {approvalFile && (
          <p className="mt-1 text-sm text-green-600">Selected: {approvalFile.name}</p>
        )}
      </div>

          </div>

          {/* Multiple Sessions (Venue & Time) */}
          <div className="form-section">
            <h2>Event Sessions (Venue & Time Slots)</h2>

            {formData.sessions.map((session, index) => (
              <div key={session.id} className="session-group form-container"> {/* Use form-container style for each session */}
                <h3>Session {index + 1}</h3>
                <div className="form-group form-group-inline">
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
                    <label htmlFor={`startTime-${session.id}`} className="form-label">Start Time:</label>
                    <input
                      type="time"
                      id={`startTime-${session.id}`}
                      name="startTime"
                      value={session.startTime}
                      onChange={(e) => handleSessionInputChange(session.id, e)}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group-item">
                    <label htmlFor={`endTime-${session.id}`} className="form-label">End Time:</label>
                    <input
                      type="time"
                      id={`endTime-${session.id}`}
                      name="endTime"
                      value={session.endTime}
                      onChange={(e) => handleSessionInputChange(session.id, e)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`venue-${session.id}`} className="form-label">Venue:</label>
                  <select
                    id={`venue-${session.id}`}
                    name="venueId" // Store the venue ID
                    value={session.venueId}
                    onChange={(e) => handleSessionInputChange(session.id, e)}
                    required
                    className="form-input"
                  >
                    <option value="">Select a Venue</option> {/* Default empty option */}
                    {mockVenues.map(venue => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} (Capacity: {venue.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove Session Button (show if more than one session) */}
                {formData.sessions.length > 1 && (
                  <div className="remove-session-button">
                    <button type="button" onClick={() => handleRemoveSession(session.id)} className="button-secondary">
                      Remove Session
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Button to Add More Sessions */}
            <button type="button" onClick={handleAddSession} className="button-secondary" style={{ marginTop: '15px' }}>
              + Add Another Session
            </button>

          </div>


          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Submit for Approval {/* Changed button text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}