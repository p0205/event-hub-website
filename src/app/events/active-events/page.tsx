// src/app/events/[id]/page.tsx
'use client'; // This is a Client Component because it uses React Hooks and browser APIs

import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'next/navigation'; // To get route parameters (the event ID)
import Link from 'next/link'; // Used for internal navigation links

// --- Interface Definitions ---
// In a real project, you can move these interface definitions to a separate file (e.g., src/types/event.ts)
interface Venue {
  id: string;
  name: string;
  capacity: number;
  // Other venue details
}

interface Session {
  id: string; // Backend-assigned Session ID
  name?: string; // Session/Activity Name - Added
  date: string; // Date in YYYY-MM-DD format
  startTime: string; // Start time in HH:mm format
  endTime?: string;   // End time in HH:mm format (optional)
  venue: Venue; // The Venue object for this Session
}

interface TeamMember {
  id: string; // User ID
  name: string;
  email: string;
  role: string; // Role assigned within this event's team
}

interface EventDetails {
  id: string;
  title: string;
  description: string;
  sessions: Session[];
  maxParticipants?: number; // Expected number of participants (optional)
  visibility: 'public' | 'private' | 'unlisted';
  status: 'active' | 'pending_approval' | 'approved' | 'rejected' | 'completed'; // Event status
  budgetAllocated: number; // Budget allocated - Added
  budgetUsed: number;     // Budget used - Added
  team: TeamMember[];     // Team members list - Added
  googleFormLink?: string; // Google Form registration link (optional)
  posters: string[]; // List of poster image URLs (example)
  // photos: string[]; // List of photo URLs (example, might need to be fetched separately)
  organizerId: string; // Organizer User ID (for permission checks)
  // Other event detail fields
}

// User search result interface
interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

// --- MOCK Data ---
// In a real project, you would fetch this data from your backend API based on the event ID
const mockEventDetails: EventDetails = {
  id: 'event-active-1', // Ensure this ID matches one from your active events list
  title: 'Weekly Team Sync Meeting', // Example title
  description: 'Review progress from the past week, discuss tasks for the current week, ensure team members are aligned and have the necessary resources.', // Example description
  sessions: [
    {
      id: 'session-a1-1',
      name: 'Main Sync Segment', // Added Session name
      date: '2025-04-21',
      startTime: '10:00',
      endTime: '11:00',
      venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 },
    },
     {
      id: 'session-a1-2',
      name: 'Breakout Discussion (Optional)', // Added Session name
      date: '2025-04-21',
      startTime: '11:00',
      endTime: '11:30',
      venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 }, // Can be same or different venue
    },
  ],
  maxParticipants: 15,
  visibility: 'private',
  status: 'active',
  budgetAllocated: 5000.00, // Example budget
  budgetUsed: 3500.50,      // Example used budget
  team: [ // Example team members
    { id: 'user-1', name: 'Alice Smith', email: 'alice.smith@example.com', role: 'Team Lead' },
    { id: 'user-2', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Volunteer' },
  ],
  googleFormLink: 'https://forms.gle/xxxxxxxxxxxx', // Example Google Form link
  posters: ['/images/mock-poster-1.jpg', '/images/mock-poster-2.png'], // Example poster image URLs
  organizerId: 'current-user-id', // Assuming the current user is the organizer for this mock data
};

// Mock User Search Results
const mockUserSearchResults: UserSearchResult[] = [
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie.b@example.com' },
    { id: 'user-4', name: 'David Green', email: 'david.g@example.com' },
];
// --- End Mock Data ---


// --- Tab Content Components (Placeholders) ---
// In a real project, you can split these components into separate files (e.g., src/components/event-details/OverviewTab.tsx)

const OverviewTab = ({ event }: { event: EventDetails }) => (
    <div className="tab-content-section form-container"> {/* Reuse card styling */}
        <h3>Overview</h3>
        <p><strong>Description:</strong> {event.description}</p>
        {/* Display Sessions */}
         {event.sessions && event.sessions.length > 0 && (
            <div className="event-sessions-overview"> {/* Use a specific class for styling */}
                <h4>Event Sessions:</h4>
                 <ul className="sessions-list-overview"> {/* Reuse/adjust styling classes */}
                     {event.sessions.map(session => (
                         <li key={session.id} className="session-item-overview"> {/* Reuse/adjust styling classes */}
                             {session.name && <strong>{session.name}: </strong>} {/* Display Session Name */}
                             Date: {session.date} | Time: {session.startTime} {session.endTime && `- ${session.endTime}`} | Venue: {session.venue.name} (Capacity: {session.venue.capacity})
                         </li>
                     ))}
                 </ul>
             </div>
         )}
         {/* Other overview information... */}
    </div>
);

const BudgetTab = ({ event }: { event: EventDetails }) => {
    const budgetPercentage = event.budgetAllocated > 0 ? (event.budgetUsed / event.budgetAllocated) * 100 : 0;

    return (
        <div className="tab-content-section form-container"> {/* Reuse card styling */}
            <h3>Budget Overview</h3>
            <p><strong>Allocated Budget:</strong> ${event.budgetAllocated.toFixed(2)}</p>
            <p><strong>Used Budget:</strong> ${event.budgetUsed.toFixed(2)}</p>

            {/* Budget Progress Bar */}
            <div className="budget-progress-bar-container" style={{ width: '80%', marginTop: '15px' }}> {/* Example width, adjust as needed */}
               <div
                   className="budget-progress-bar"
                   style={{ width: `${Math.min(budgetPercentage, 100)}%` }} // Progress capped at 100%
               >
                   <span className="progress-text">{budgetPercentage.toFixed(1)}%</span>
               </div>
           </div>
            {budgetPercentage > 100 && (
               <p style={{ color: 'red', marginTop: '5px' }}>Budget Exceeded!</p>
           )}
            {/* TODO: Add functionality for managing budget items (adding/editing expenses etc.) */}
        </div>
    );
};

const TeamTab = ({ event }: { event: EventDetails }) => {
    // TODO: Implement Team Member Search and Add functionality here
     const [teamSearchTerm, setTeamSearchTerm] = useState('');
     // In a real project, the type of search results should be UserSearchResult[]
     const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
     const [isSearchingUsers, setIsSearchingUsers] = useState(false);

     // Basic search simulation and debounce
     useEffect(() => {
         if (teamSearchTerm.length < 2) { // Search only if at least 2 characters are typed, adjust as needed
             setUserSearchResults([]);
             setIsSearchingUsers(false); // Stop searching status
             return;
         }

         const delayDebounceFn = setTimeout(() => {
             console.log("Simulating user search for:", teamSearchTerm);
             setIsSearchingUsers(true);
             // TODO: Call your backend API for user search (by email or name)
             // Example: fetch(`/api/users/search?query=${encodeURIComponent(teamSearchTerm)}`)
             // For demonstration, filtering mock data here
             const results = mockUserSearchResults.filter(user =>
                 user.email.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                 user.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
             );

              // Simulate API call delay
              new Promise(resolve => setTimeout(resolve, 300)).then(() => {
                 setUserSearchResults(results);
                 setIsSearchingUsers(false);
                 console.log("Search Results (Simulated):", results);
              });


         }, 500); // Debounce search by 500ms, adjust delay

         // Cleanup function to clear timeout if search term changes or component unmounts
         return () => clearTimeout(delayDebounceFn);
     }, [teamSearchTerm]); // Dependency array includes the search term


    const handleAddTeamMember = (user: UserSearchResult) => {
       // TODO: Implement logic to add the user to the event team and assign a role
       console.log(`Simulating adding user to team:`, user);
       // This would typically involve a modal or form to select the role and confirm,
       // followed by a backend API call (e.g., POST /api/events/{eventId}/team) to update the team information.
       alert(`Simulating adding user ${user.name} to the team...`); // Simple alert
       // After successful addition, you likely need to re-fetch event details to update the team list
    };


    return (
        <div className="tab-content-section form-container"> {/* Reuse card styling */}
            <h3>Event Team</h3>
            {event.team && event.team.length > 0 ? (
                 <ul className="team-list"> {/* Reuse team-list class */}
                    {event.team.map(member => (
                        <li key={member.id} className="team-member-item"> {/* Reuse team-member-item class */}
                            <span>{member.name} ({member.email}) - <strong>{member.role}</strong></span>
                            {/* TODO: Add action buttons, like "Remove from Team", "Change Role" (show based on permissions) */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No members in the team yet.</p>
            )}


            {/* Add Team Member Section (Visible to Organizer/Admins) */}
            {/* Assume currentUserId is the logged-in user's ID */}
             {/* {currentUserId === event.organizerId && ( */} {/* Conditionally render based on actual permission logic */}
                <div className="add-team-member-section"> {/* Reuse class */}
                    <h4>Add Team Member</h4>
                    <div className="form-group"> {/* Reuse form-group */}
                        <label htmlFor="team-search" className="form-label">Search User (Email/Name):</label>
                         <input
                             type="text"
                             id="team-search"
                             className="form-input"
                             value={teamSearchTerm}
                             onChange={(e) => setTeamSearchTerm(e.target.value)}
                             placeholder="Enter email or name to search"
                         />
                         {isSearchingUsers && <p>Searching...</p>}
                    </div>

                    {/* Display Search Results */}
                     {userSearchResults.length > 0 && teamSearchTerm.length >= 2 && !isSearchingUsers && (
                        <div className="search-results-list form-container"> {/* Reuse class */}
                            <p className="form-label">Matching Users:</p>
                            <ul>
                                {userSearchResults.map(user => (
                                    <li key={user.id} className="search-result-item"> {/* Reuse class */}
                                        <span>{user.name} ({user.email})</span>
                                         {/* TODO: "Add" button - onClick should add user to team */}
                                         <button onClick={() => handleAddTeamMember(user)} className="button-secondary button-small">Add</button> {/* Reuse button styles */}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}
                      {teamSearchTerm.length >= 2 && !isSearchingUsers && userSearchResults.length === 0 && (
                           <div className="search-results-list form-container">
                               <p className="form-label">No users found matching "{teamSearchTerm}".</p>
                           </div>
                      )}
                       {/* Message if search term is too short */}
                       {teamSearchTerm.length < 2 && userSearchResults.length === 0 && !isSearchingUsers && (
                           <div className="search-results-list form-container">
                               <p className="form-label">Enter at least 2 characters to search for users.</p>
                           </div>
                       )}
                </div>
             {/* )} */} {/* End conditional rendering for organizer */}
        </div>
    );
};

const AttendanceTab = ({ event }: { event: EventDetails }) => {
    // TODO: Implement QR Code Generation and Download
     const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null); // Stores the URL or Base64 data of the QR code image
     const [isGeneratingQr, setIsGeneratingQr] = useState(false); // Indicates if QR code is being generated

     const handleGenerateQrCode = async () => {
        setIsGeneratingQr(true);
        setQrCodeUrl(null); // Clear previous QR code before generating new one
        console.log("Simulating QR code generation for event:", event.id);

        // TODO: Call your backend API to generate the QR code
        // Example API: POST /api/attendance/generate-qr { eventId: event.id, ... }
        // The backend should return the QR code image URL or Base64 data
        try {
             // Simulate backend generating QR code and returning URL
             await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay
             // Assuming backend returns a directly accessible image URL
             const generatedUrl = `/api/qrcode/event-${event.id}-${Date.now()}.png`; // Example mock URL (with timestamp to avoid caching)

             // Actual API call example:
             // const response = await fetch(`/api/attendance/generate-qr?eventId=${event.id}`, { method: 'POST', /* headers, body if needed */ });
             // if (!response.ok) { throw new Error('Failed to generate QR code'); }
             // const data = await response.json(); // Assuming expected response is { qrCodeUrl: '...' } or { qrCodeBase64: '...' }
             // setQrCodeUrl(data.qrCodeUrl || `data:image/png;base64,${data.qrCodeBase64}`); // Set QR code URL or Data URL

             setQrCodeUrl(generatedUrl); // Using the mock URL

        } catch (e: any) {
            console.error("Failed to generate QR code:", e);
            // TODO: Display error message to the user
             alert(`Failed to generate QR code: ${e.message || 'Unknown error'}`);
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const handleDownloadQrCode = () => {
        if (qrCodeUrl) {
            // Use the browser's download functionality
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            // Set the download filename
            link.download = `event-${event.id}-attendance-qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="tab-content-section form-container"> {/* Reuse card styling */}
            <h3>Attendance & Check-in</h3>
            <p>Check-in can be done via the generated QR Code or the mobile app (future).</p> {/* Mention mobile app method */}

            <h4>Generate QR Code for Attendance</h4>
            <p>Click the button below to generate the QR code image. Team members can download and print this QR code for participants to scan at the event.</p>
            <div className="qr-code-section"> {/* Reuse class */}
                 <button onClick={handleGenerateQrCode} className="button-primary" disabled={isGeneratingQr}> {/* Reuse button styles */}
                     {isGeneratingQr ? 'Generating...' : 'Generate & Download QR Code'}
                 </button>

                {/* Display the generated QR code image and download button */}
                {qrCodeUrl && (
                    <div className="qr-code-display" style={{ marginTop: '15px', textAlign: 'center' }}> {/* Reuse style */}
                        <img src={qrCodeUrl} alt={`QR Code for event "${event.title}"`} style={{ maxWidth: '200px', height: 'auto', border: '1px solid #eee', padding: '10px', backgroundColor: 'white' }} />
                        <br/> {/* Line break */}
                         <button onClick={handleDownloadQrCode} className="button-secondary" style={{ marginTop: '10px' }}>Download QR Code Image</button> {/* Reuse button styles */}
                         {/* If the QR code is Base64 data, you might need different download handling or instruct the user to right-click save */}
                         {qrCodeUrl.startsWith('data:') && (
                             <p style={{fontSize:'0.9em', color: '#555', marginTop: '5px'}}>Right-click on the QR code image and select "Save Image As..." to download.</p>
                         )}
                    </div>
                )}
            </div>
            {/* TODO: Add a link to view Attendance Data or Reports (navigate to a dedicated report page) */}
             {/* <div style={{marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee'}}>
                 <h4>Attendance Data</h4>
                  <p>View the list of checked-in participants and detailed attendance records.</p>
                   <Link href={`/events/${event.id}/attendance-report`} className="button-secondary">View Attendance Report</Link>
             </div> */}
        </div>
    );
};

const MediaTab = ({ event }: { event: EventDetails }) => {
     // TODO: Implement File Uploads and Image Display functionality
     // In a real project, you need to manage the state of uploaded images
     const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]); // Stores a list of uploaded photo URLs (frontend example only)

     const handleUploadFile = async (section: 'poster' | 'photo', event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        console.log(`Simulating upload for ${section}:`, files);
        // TODO: Use FormData to send files to your backend API
        // Example: const formData = new FormData(); formData.append('file', files[0]); ... fetch('/api/upload', { method: 'POST', body: formData });

        // Simulate adding images to the list after a successful upload (frontend example only)
         const uploadedUrls = Array.from(files).map(file => URL.createObjectURL(file)); // Create temporary local URLs
         if(section === 'photo') {
             setUploadedPhotos(prevPhotos => [...prevPhotos, ...uploadedUrls]);
         }
         // For posters, you might replace the event.posters state or trigger event details refresh
         console.log("Simulation: Upload complete");

        // TODO: Call your backend API for upload. After successful upload, refresh event details data or update corresponding media list state.
        // In a real application, you need to handle upload progress, errors, etc.
     };

     // Cleanup for simulated local URL objects to prevent memory leaks
     useEffect(() => {
         return () => {
             uploadedPhotos.forEach(url => URL.revokeObjectURL(url));
         };
     }, [uploadedPhotos]); // Run cleanup when uploadedPhotos list changes


    return (
        <div className="tab-content-section form-container"> {/* Reuse card styling */}
            <h3>Event Media & Archiving</h3>

            {/* Poster Upload Section */}
             <h4>Event Posters</h4>
              <p>Upload promotional posters for your event.</p>
             <div className="upload-section form-group"> {/* Reuse classes */}
                <label htmlFor="poster-upload-media" className="form-label">Upload Poster File(s):</label>
                 <input type="file" id="poster-upload-media" onChange={(e) => handleUploadFile('poster', e)} multiple accept="image/*" className="form-input" /> {/* Allow multiple image files */}

                 {/* Uploaded Poster Preview */}
                 <div className="uploaded-media-preview" style={{ marginTop: '15px' }}> {/* Reuse style */}
                     {event.posters && event.posters.length > 0 ? (
                         event.posters.map((posterUrl, index) => (
                              // You can wrap the image in a Link to view full size
                             <img key={index} src={posterUrl} alt={`Event Poster ${index + 1}`} style={{ maxWidth: '150px', height: 'auto', marginRight: '10px', border: '1px solid #eee' }} />
                         ))
                     ) : (
                         <p>No posters uploaded yet.</p>
                     )}
                 </div>
             </div>

            {/* Event Photos Upload Section (for Archiving) */}
            <h4>Event Photos (for Archiving)</h4>
            <p>Team members can upload photos taken on the day of the event here.</p>
             <div className="upload-section form-group"> {/* Reuse classes */}
                <label htmlFor="photo-upload-media" className="form-label">Upload Event Photos:</label>
                 <input type="file" id="photo-upload-media" onChange={(e) => handleUploadFile('photo', e)} multiple accept="image/*" className="form-input" /> {/* Allow multiple image files, accept only images */}

                  {/* Uploaded Photos Preview (Frontend simulation only) */}
                  <div className="uploaded-media-preview" style={{ marginTop: '15px' }}>
                      {uploadedPhotos.length > 0 ? (
                          uploadedPhotos.map((photoUrl, index) => (
                              <img key={index} src={photoUrl} alt={`Event Photo ${index + 1} (Simulated)`} style={{ maxWidth: '150px', height: 'auto', marginRight: '10px', border: '1px solid #eee' }} />
                          ))
                      ) : (
                           <p>Uploaded photos will appear here in a gallery.</p> // In a real app, you'd display images from event.photos list
                      )}
                  </div>
                  {/* TODO: Implement a more comprehensive image gallery component */}
             </div>
        </div>
    );
};

const RegistrationTab = ({ event }: { event: EventDetails }) => (
    <div className="tab-content-section form-container"> {/* Reuse card styling */}
        <h3>Registration Information</h3>
         <h4>Google Form Registration</h4>
         <p>Participants register using the following Google Form:</p>
         {event.googleFormLink ? (
             <p><a href={event.googleFormLink} target="_blank" rel="noopener noreferrer" className="breadcrumb-link">{event.googleFormLink}</a></p>
         ) : (
             <p>No Google Form registration link provided for this event.</p>
         )}
         <p style={{marginTop: '10px'}}><strong>For Team Members:</strong> You can access the Google Form responses to view registration information and export it to an Excel file to get the participant list.</p>
         {/* If you have a direct link to the responses page, you can provide it here */}
         {/* <p><a href={event.googleFormResponsesLink} target="_blank" rel="noopener noreferrer" className="button-secondary button-small">View Form Responses</a></p> */}

          {/* Mention mobile app registration */}
          {/* <h4>Mobile App Registration</h4>
          <p>Participants can also register through the mobile application (Future feature).</p> */}
          {/* TODO: In the future, add management features or data related to mobile app registration here */}
    </div>
);


// --- Main Page Component ---
export default function ActiveEventDetailsPage() {
  // Get the event ID from the route parameters (e.g., from /events/event-active-1)
  const params = useParams();
  const eventId = params.id as string; // Cast the parameter to a string type

  const [event, setEvent] = useState<EventDetails | null>(null); // State to store the fetched event details data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message state
  const [activeTab, setActiveTab] = useState('overview'); // State to control the currently selected tab

  // Assume the current logged-in user's ID (for permission checks, replace with actual authentication system logic)
  const currentUserId = 'current-user-id'; // TODO: Replace with the actual logged-in user's ID

  // Function to render the content component based on the active tab
  const renderTabContent = () => {
    if (!event) return null; // Don't render tab content if event data is not loaded

    switch (activeTab) {
      case 'overview':
        return <OverviewTab event={event} />;
      case 'budget':
        return <BudgetTab event={event} />;
      case 'team':
        return <TeamTab event={event} />;
      case 'attendance':
        return <AttendanceTab event={event} />;
      case 'media':
        return <MediaTab event={event} />;
      case 'registration':
        return <RegistrationTab event={event} />;
      default:
        return <OverviewTab event={event} />; // Default to Overview tab
    }
  };

  // Use the useEffect hook to fetch event details data when the component mounts or eventId changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear any previous error message
      try {
        // TODO: **IMPORTANT** Replace with your actual backend API endpoint to fetch event details by ID
        // Example API call: `/api/events/${eventId}`
        // You need to include authentication information here (e.g., tokens, cookies)
        // For demonstration purposes, we simulate finding mock data based on the ID
         const fetchedEvent = eventId === mockEventDetails.id ? mockEventDetails : null;

        // Actual API call example:
        // const response = await fetch(`/api/events/${eventId}`, { /* headers: { Authorization: `Bearer ${yourAuthToken}` } */ });
        // if (!response.ok) {
        //   // Handle HTTP error responses (e.g., 404 Not Found, 500 Internal Server Error)
        //   const errorData = await response.json(); // Try to read error details from the response body
        //   throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
        // }
        // const fetchedEvent = await response.json(); // Parse the JSON data from the response

        if (!fetchedEvent) {
             // If the API returns null or a 404 status, it means the event was not found
             throw new Error('Event not found or you do not have permission to access it.');
        }

        setEvent(fetchedEvent); // Set the fetched event data to state

      } catch (e: any) {
        // Catch and handle errors during the data fetching process
        console.error("Failed to fetch event details:", e);
        setError(`Failed to load event details: ${e.message || 'Unknown error'}`); // Display a user-friendly error message
      } finally {
        setLoading(false); // Stop loading
      }
    };

    // Fetch data only if eventId is available
    if (eventId) {
      fetchEventDetails();
    } else {
        // If eventId is not available (theoretically, the route should ensure it is), show an error
        setError("Invalid event ID.");
        setLoading(false);
    }

  }, [eventId]); // Dependency array - the effect will re-run if eventId changes (though it's fixed for a specific route)


  // --- Rendering ---

  // Display loading message while fetching data
  if (loading) {
    return (
      <div className="page-container">
        <p className="loading-message">Loading event details...</p>
      </div>
    );
  }

  // Display error message if fetching failed
  if (error) {
    return (
      <div className="page-container">
        <p className="error-message">Loading Error: {error}</p>
      </div>
    );
  }

  // Display "Event not found" message if event data is null after loading
  if (!event) {
       return (
           <div className="page-container">
               <p className="no-events-message">Event not found or you do not have permission to access it.</p>
           </div>
       );
  }


  // Display event details when data is successfully loaded
  return (
    <div className="page-container">
      {/* Breadcrumbs will be rendered by your global Layout */}

      {/* Event Header Area (always visible at the top) */}
      <div className="event-header-details section-card form-container"> {/* Reuse card styling */}
        <div className="flex justify-between items-center"> {/* Use flex to align title and button side-by-side */}
            <h1>{event.title}</h1>
            {/* Show edit button only if the current user is the organizer (example permission check) */}
            {currentUserId === event.organizerId && (
                 <button onClick={() => console.log("Edit Event button clicked (placeholder)")} className="button-secondary"> {/* Reuse button styles, onClick performs edit logic */}
                     Edit Event
                 </button>
            )}
        </div>
        <p><strong>Status:</strong> {event.status.replace('_', ' ')}</p> {/* Display event status, replace underscore with space */}
        <p><strong>Visibility:</strong> {event.visibility}</p> {/* Display visibility */}
        {event.maxParticipants !== undefined && (
            <p><strong>Expected Participants:</strong> {event.maxParticipants}</p>
        )}
         {/* You could add quick links to sections below here */}
      </div>

       {/* Tabs Navigation Area */}
       <div className="tabs-container" style={{ marginBottom: '20px' }}> {/* Reuse/adjust styling */}
           {/* Button for each tab */}
           <button
               className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} // Apply 'active' class if this is the active tab
               onClick={() => setActiveTab('overview')} // On click, set the active tab state
           >
               Overview
           </button>
           <button
                className={`tab-button ${activeTab === 'budget' ? 'active' : ''}`}
                onClick={() => setActiveTab('budget')}
           >
               Budget
           </button>
           <button
                className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
           >
               Team
           </button>
           <button
                className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
           >
               Attendance
           </button>
            <button
                className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => setActiveTab('media')}
           >
               Media
           </button>
            <button
                className={`tab-button ${activeTab === 'registration' ? 'active' : ''}`}
                onClick={() => setActiveTab('registration')}
           >
               Registration
           </button>
           {/* Add more tab buttons here if you have more modules */}
       </div>

       {/* Tab Content Display Area */}
       <div className="tab-content-area"> {/* Reuse/adjust styling */}
            {/* Render the content component for the currently active tab */}
            {renderTabContent()}
       </div>

    </div>
  );
}