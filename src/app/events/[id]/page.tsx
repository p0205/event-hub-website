// src/app/events/[id]/page.tsx
'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // To get route parameters (the event ID)
import Link from 'next/link'; // For any internal links

// --- Define Interfaces ---
interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface Session {
  id: string; // Backend-assigned session ID
  name?: string; // Session/Activity Name - Added
  date: string; // Date in YYYY-MM-DD format
  startTime: string; // Time in HH:mm format
  endTime?: string;   // Optional end time in HH:mm format
  venue: Venue; // The venue object for this session
}

interface TeamMember {
  id: string; // User ID
  name: string;
  email: string;
  role: string; // Role assigned in this event's team
}

interface EventDetails {
  id: string;
  title: string;
  description: string;
  sessions: Session[];
  maxParticipants?: number;
  visibility: 'public' | 'private' | 'unlisted';
  status: 'active' | 'pending_approval' | 'approved' | 'rejected' | 'completed'; // Can be other statuses
  budgetAllocated: number; // Added budget fields
  budgetUsed: number;     // Added budget fields
  team: TeamMember[];     // Added team members
  googleFormLink?: string; // Optional Google Form link
  posters: string[]; // Array of poster image URLs (example)
  // photos: string[]; // Photos might be fetched separately or be in a sub-collection
  organizerId: string; // To check if the current user is the organizer (for edit/manage permissions)
  // Add other relevant event details
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

// --- MOCK DATA ---
// In a real application, fetch this from your backend API based on the event ID
const mockEventDetails: EventDetails = {
  id: 'event-active-1', // Match an ID from your active events list
  title: 'Weekly Team Sync',
  description: 'Regular check-in with the team to discuss progress and tasks for the week. Review last week\'s action items and set goals for the next sprint. Ensure everyone is aligned and has the necessary resources.',
  sessions: [
    {
      id: 'session-a1-1',
      name: 'Main Sync', // Added session name
      date: '2025-04-21',
      startTime: '10:00',
      endTime: '11:00',
      venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 },
    },
     {
      id: 'session-a1-2',
      name: 'Breakout Discussion (Optional)', // Added session name
      date: '2025-04-21',
      startTime: '11:00',
      endTime: '11:30',
      venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 }, // Can be same or different venue
    },
  ],
  maxParticipants: 15,
  visibility: 'private',
  status: 'active',
  budgetAllocated: 1500.00, // Example budget
  budgetUsed: 750.50,      // Example budget
  team: [ // Example team members
    { id: 'user-1', name: 'Alice Smith', email: 'alice.smith@example.com', role: 'Team Lead' },
    { id: 'user-2', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Volunteer' },
  ],
  googleFormLink: 'https://forms.gle/xxxxxxxxxxxx', // Example Google Form link
  posters: ['/images/poster-placeholder-1.png', '/images/poster-placeholder-2.png'], // Example poster images
  organizerId: 'current-user-id', // Replace with ID of the user who organized this event in mock data
};

// Mock User Search Results
const mockUserSearchResults: UserSearchResult[] = [
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie.b@example.com' },
    { id: 'user-4', name: 'David Green', email: 'david.g@example.com' },
];
// -----------------------


export default function ActiveEventDetailsPage() {
  // Get the event ID from the route parameters (e.g., from /events/event-active-1)
  const params = useParams();
  const eventId = params.id as string; // Cast to string

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode (basic placeholder)

  // State for Team Member Search
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // State for QR Code display
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Assume current user ID is available (e.g., from auth context)
  // const currentUserId = 'current-user-id'; // TODO: Replace with actual logged-in user ID
  const currentUserId = '1'; // TODO: Replace with actual logged-in user ID


  // Fetch event details when the component mounts or eventId changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API endpoint to fetch event details by ID
        // Example: `/api/events/${eventId}`
        // For now, simulate fetching mock data based on the ID (in a real app, API would handle this)
         const fetchedEvent = eventId === mockEventDetails.id ? mockEventDetails : null;


        // const response = await fetch(`/api/events/${eventId}`, { /* auth headers */ });
        // if (!response.ok) { /* handle error */ }
        // const fetchedEvent = await response.json();


        if (!fetchedEvent) {
             throw new Error('Event not found'); // Handle case where ID doesn't match
        }

        setEvent(fetchedEvent);

      } catch (e: any) {
        console.error("Failed to fetch event details:", e);
        setError("Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }

  }, [eventId]); // Refetch if eventId changes (though in this route it won't)

  // Handle search input change for team members (with basic debounce idea)
  useEffect(() => {
      if (teamSearchTerm.length < 3) { // Only search if at least 3 characters are typed
          setUserSearchResults([]);
          return;
      }

      const delayDebounceFn = setTimeout(() => {
          searchUsers(teamSearchTerm);
      }, 500); // Debounce search by 500ms

      return () => clearTimeout(delayDebounceFn); // Cleanup timeout
  }, [teamSearchTerm]); // Run effect when search term changes


  const searchUsers = async (query: string) => {
      setIsSearchingUsers(true);
      // TODO: Replace with your actual API call to search users by email
      // Example: `/api/users/search?email=${query}`
      // For now, filter mock results
      const results = mockUserSearchResults.filter(user =>
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.name.toLowerCase().includes(query.toLowerCase())
      );

       // Simulate API delay
       await new Promise(resolve => setTimeout(resolve, 300));

      setUserSearchResults(results);
      setIsSearchingUsers(false);
  };


  // --- Handlers for Actions ---
  const handleEditClick = () => {
     // TODO: Implement actual edit functionality
     setIsEditing(!isEditing); // Example: toggle a basic edit mode state
     console.log('Edit Event clicked');
     // In a real app, you might navigate to an edit form:
     // router.push(`/events/${eventId}/edit`);
  };

   const handleAddTeamMember = (userId: string) => {
       // TODO: Implement logic to add user to the event team and assign role
       console.log(`Adding user ${userId} to team (placeholder)`);
       // This would likely involve a modal or form to select role and confirm addition,
       // followed by an API call to update the event team.
   };

    const handleGenerateQrCode = async () => {
        setIsGeneratingQr(true);
        setQrCodeUrl(null); // Clear previous QR code

        // TODO: Call your backend API to generate the QR code
        // Pass eventId and potentially session ID if check-in is per session
        // Example: `/api/attendance/generate-qr?eventId=${eventId}`
        try {
             // Simulate backend generating QR code and returning URL
             await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
             const generatedUrl = `/api/qrcode/event-${eventId}.png`; // Example mock URL

             // const response = await fetch(`/api/attendance/generate-qr?eventId=${eventId}`, { /* auth */ });
             // if (!response.ok) { /* handle error */ }
             // const data = await response.json(); // Expecting { qrCodeUrl: '...' }

             setQrCodeUrl(generatedUrl); // Assuming API returns a direct URL
             // Or if API returns base64: setQrCodeUrl(`data:image/png;base64,${data.qrCodeBase64}`);

        } catch (e) {
            console.error("Failed to generate QR code:", e);
            // Show error message
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const handleDownloadQrCode = () => {
        if (qrCodeUrl) {
            // Create a temporary link element to trigger download
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = `event-${eventId}-qrcode.png`; // Suggested download filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleUploadPoster = (event: React.ChangeEvent<HTMLInputElement>) => {
       // TODO: Implement poster file upload logic
       console.log('Poster upload triggered:', event.target.files);
       // Use FormData to send file to backend API
    };

     const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
       // TODO: Implement photo file upload logic (for archiving)
       console.log('Photo upload triggered:', event.target.files);
       // Use FormData to send file to backend API
    };


    // --- Rendering ---
  if (loading) {
    return (
      <div className="page-container">
        <p className="loading-message">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p className="error-message">Error: {error}</p>
      </div>
    );
  }

  if (!event) {
       return (
           <div className="page-container">
               <p className="no-events-message">Event not found.</p>
           </div>
       );
  }

    // Calculate budget percentage
    const budgetPercentage = event.budgetAllocated > 0
        ? (event.budgetUsed / event.budgetAllocated) * 100
        : 0; // Avoid division by zero


  return (
    <div>
      {/* Breadcrumbs will be rendered by the layout */}
      {/* <h1>{event.title}</h1> // Title is likely better within a section */}

      {/* Event Header / Overview */}
      <div className="section-card form-container"> {/* Reuse card styling */}
        <div className="flex justify-between items-center"> {/* Flex to place title and button side-by-side */}
            <h1>{event.title}</h1>
            {/* Show edit button only if current user is the organizer (example permission check) */}
            {currentUserId === event.organizerId && (
                 <button onClick={handleEditClick} className="button-secondary">
                     {isEditing ? 'Exit Edit Mode' : 'Edit Event'} {/* Example button text change */}
                 </button>
            )}
        </div>
        <p><strong>Status:</strong> {event.status.replace('_', ' ')}</p>
        <p><strong>Visibility:</strong> {event.visibility}</p>
        {event.maxParticipants !== undefined && (
            <p><strong>Expected Participants:</strong> {event.maxParticipants}</p>
        )}
        <div className="description-section">
           <p><strong>Description:</strong></p>
           <p>{event.description}</p>
        </div>
      </div>

      {/* Budget Overview */}
       <div className="section-card form-container">
           <h2>Budget</h2>
           <p><strong>Allocated:</strong> ${event.budgetAllocated.toFixed(2)}</p>
           <p><strong>Used:</strong> ${event.budgetUsed.toFixed(2)}</p>
           <div className="budget-progress-bar-container">
               <div
                   className="budget-progress-bar"
                   style={{ width: `${Math.min(budgetPercentage, 100)}%` }} // Cap at 100%
               >
                   <span className="progress-text">{budgetPercentage.toFixed(1)}%</span>
               </div>
           </div>
           {budgetPercentage > 100 && (
               <p style={{ color: 'red', marginTop: '5px' }}>Budget exceeded!</p>
           )}
       </div>

      {/* Sessions */}
      {event.sessions && event.sessions.length > 0 && (
          <div className="section-card form-container">
              <h2>Sessions</h2>
              <ul className="sessions-list">
                  {event.sessions.map((session, index) => (
                      <li key={session.id} className="session-item">
                          {session.name && <h3>{session.name}</h3>} {/* Display Session Name */}
                          <p><strong>Date:</strong> {session.date}</p>
                          <p><strong>Time:</strong> {session.startTime} {session.endTime && `- ${session.endTime}`}</p>
                          <p><strong>Venue:</strong> {session.venue.name} (Capacity: {session.venue.capacity})</p>
                      </li>
                  ))}
              </ul>
          </div>
      )}


      {/* Team Management */}
      <div className="section-card form-container">
          <h2>Event Team</h2>
          <ul className="team-list">
              {event.team.map(member => (
                  <li key={member.id} className="team-member-item">
                      <span>{member.name} ({member.email}) - <strong>{member.role}</strong></span>
                      {/* TODO: Add options like "Remove from Team", "Change Role" - conditional on permissions */}
                  </li>
              ))}
          </ul>

          {/* Add Team Member Section (Organizer View) */}
           {currentUserId === event.organizerId && ( // Show only for organizer
              <div className="add-team-member-section">
                  <h3>Add Team Member</h3>
                  <div className="form-group form-group-inline">
                      <div className="form-group-item" style={{ flex: 2 }}> {/* Give search input more space */}
                         <label htmlFor="team-member-email" className="form-label">Search by Email:</label>
                          <input
                              type="email"
                              id="team-member-email"
                              className="form-input"
                              value={teamSearchTerm}
                              onChange={(e) => setTeamSearchTerm(e.target.value)}
                              placeholder="Enter email to search"
                          />
                           {isSearchingUsers && <p>Searching...</p>}
                      </div>
                      {/* Role selection would typically be here or in a modal */}
                       {/*
                       <div className="form-group-item">
                            <label htmlFor="team-member-role" className="form-label">Assign Role:</label>
                           <select id="team-member-role" className="form-input">
                                <option value="">Select Role</option>
                                 </select>
                       </div>
                       */}
                  </div>

                   {/* Display Search Results */}
                   {userSearchResults.length > 0 && (
                      <div className="search-results-list form-container"> {/* Use form-container style for results box */}
                          <p className="form-label">Matching Users:</p>
                          <ul>
                              {userSearchResults.map(user => (
                                  <li key={user.id} className="search-result-item">
                                      <span>{user.name} ({user.email})</span>
                                      {/* TODO: Button to add this user to the team */}
                                      <button onClick={() => handleAddTeamMember(user.id)} className="button-secondary button-small">Add</button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                   )}
                    {teamSearchTerm.length >= 3 && !isSearchingUsers && userSearchResults.length === 0 && (
                         <div className="search-results-list form-container">
                             <p className="form-label">No users found matching "{teamSearchTerm}".</p>
                         </div>
                    )}
                     {/* Display message if search term is too short */}
                     {teamSearchTerm.length < 3 && userSearchResults.length === 0 && !isSearchingUsers && (
                         <div className="search-results-list form-container">
                             <p className="form-label">Enter at least 3 characters to search for users.</p>
                         </div>
                     )}
              </div>
           )}

      </div>

      {/* Attendance & QR Code */}
       <div className="section-card form-container">
           <h2>Attendance & Check-in</h2>
            <p>Check-in can be done via a generated QR Code or the mobile app.</p> {/* Mention mobile app method */}

            <h3>Generate QR Code for Attendance</h3>
             <p>Team members can download and print this QR code for participants to scan at the event.</p>
            <div className="qr-code-section">
                 <button onClick={handleGenerateQrCode} className="button-primary" disabled={isGeneratingQr}>
                     {isGeneratingQr ? 'Generating...' : 'Generate & Download QR Code'}
                 </button>

                {/* Display the generated QR code and download link */}
                {qrCodeUrl && (
                    <div className="qr-code-display" style={{ marginTop: '15px', textAlign: 'center' }}>
                        <img src={qrCodeUrl} alt={`QR Code for ${event.title}`} style={{ maxWidth: '200px', height: 'auto', border: '1px solid #eee', padding: '10px', backgroundColor: 'white' }} />
                        <p><button onClick={handleDownloadQrCode} className="button-secondary" style={{ marginTop: '10px' }}>Download QR Code</button></p>
                        <p style={{fontSize:'0.9em', color: '#555', marginTop: '5px'}}>Share this image with your team for printing.</p>
                    </div>
                )}
            </div>
       </div>


      {/* Registration Information */}
       <div className="section-card form-container">
           <h2>Registration</h2>
           <h3>Google Form Registration</h3>
           <p>Participants can register using the following Google Form:</p>
           {event.googleFormLink ? (
               <p><a href={event.googleFormLink} target="_blank" rel="noopener noreferrer" className="breadcrumb-link">{event.googleFormLink}</a></p>
           ) : (
               <p>No Google Form link provided for this event.</p> // Handle case where link is missing
           )}
           <p style={{marginTop: '10px'}}><strong>For Team Members:</strong> Access the Google Form responses to view and export the participant list to Excel.</p>
           {/* Optional: Link directly to responses if you have that URL */}
           {/* <p><a href={event.googleFormResponsesLink} target="_blank" rel="noopener noreferrer" className="button-secondary button-small">View Form Responses</a></p> */}

            {/* Mobile App Registration is mentioned but design is skipped */}
            {/* <h3>Mobile App Registration</h3>
            <p>Participants can also register through the mobile application.</p> */}
       </div>

       {/* Media / Archiving */}
       <div className="section-card form-container">
           <h2>Event Media & Archiving</h2>

           {/* Poster Upload Section */}
           <h3>Event Posters</h3>
            <div className="upload-section form-group">
                <label htmlFor="poster-upload" className="form-label">Upload Poster(s):</label>
                <input type="file" id="poster-upload" onChange={handleUploadPoster} multiple className="form-input" /> {/* Allow multiple files */}
                {/* TODO: Display uploaded posters */}
                 <div className="uploaded-media-preview" style={{ marginTop: '15px' }}>
                     {event.posters && event.posters.length > 0 ? (
                         event.posters.map((posterUrl, index) => (
                             <img key={index} src={posterUrl} alt={`Event Poster ${index + 1}`} style={{ maxWidth: '150px', height: 'auto', marginRight: '10px', border: '1px solid #eee' }} />
                         ))
                     ) : (
                         <p>No posters uploaded yet.</p>
                     )}
                 </div>
            </div>

            {/* Photos Upload Section */}
            <h3>Event Photos (for Archiving)</h3>
             <p>Team members can upload photos from the event day here.</p>
             <div className="upload-section form-group">
                <label htmlFor="photo-upload" className="form-label">Upload Photos:</label>
                 <input type="file" id="photo-upload" onChange={handleUploadPhoto} multiple accept="image/*" className="form-input" /> {/* Accept image files */}
                {/* TODO: Display uploaded photos gallery */}
                 <div className="uploaded-media-preview" style={{ marginTop: '15px' }}>
                     <p>Uploaded photos will appear here.</p> {/* Placeholder */}
                 </div>
            </div>
       </div>


      {/* TODO: Add other sections like Feedback, Reports, etc. */}

    </div>
  );
}