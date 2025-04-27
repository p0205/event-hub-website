// src/components/ParticipantReviewUI.tsx

'use client';

import React, { useState } from 'react';
import ParticipantsTable from '@/components/ParticipantsTable'; // Adjust path
import AddParticipantModal from '@/components/AddParticipantModal'; // Adjust path
import { Participant } from '@/types/user'; // Import Participant for Omit
import { v4 as uuidv4 } from 'uuid'; // Library to generate unique string IDs for new participants
import { useRouter } from 'next/navigation'; // For navigation after save

interface ParticipantReviewUIProps {
    initialParticipants: Participant[];
    eventId: string;
}

// --- Simulate API Call for SAVING ---
const simulateSaveParticipants = async (eventId: string, participants: Participant[]): Promise<boolean> => {
    console.log(`[ParticipantReviewUI] Simulating saving ${participants.length} participants for event ${eventId}`);

    const dataToSend = participants.map(p => ({
        // Send id only if it's a number (existing participant).
        // Omit or send null/undefined for new ones (where id is a string uuid).
        id: typeof p.id === 'number' ? p.id : undefined,
        name: p.name,
        email: p.email,
        phoneNo: p.phoneNo,
        gender: p.gender,
        faculty: p.faculty,
        course: p.course,
        year: p.year,
        role: p.role,
    }));

    console.log('Data sent to simulated backend save endpoint:', dataToSend);

    // --- Simulated Logic ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.1;
    if (success) {
         console.log('[ParticipantReviewUI] Simulated save successful!');
         return true;
    } else {
        console.error('[ParticipantReviewUI] Simulated save failed!');
        throw new Error('Simulated save failed on the backend.');
    }
    // --- End Simulated Logic ---
};


const ParticipantReviewUI: React.FC<ParticipantReviewUIProps> = ({ initialParticipants, eventId }) => {

    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleDeleteParticipant = (id: number | string) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    // Changed parameter type to Omit<Participant, 'id'>
    const handleAddParticipant = (newParticipantData: Omit<Participant, 'id'>) => {
        // Generate a temporary string ID for the new participant in the frontend state
        const tempId = uuidv4();
        const newParticipant: Participant = {
             ...newParticipantData,
             id: tempId, // Assign the generated unique string ID
             // Ensure nullable fields are explicitly null if empty string from form (already done in modal, but belt-and-suspenders)
             phoneNo: newParticipantData.phoneNo || null,
             gender: newParticipantData.gender || null,
             faculty: newParticipantData.faculty || null,
             course: newParticipantData.course || null,
             year: newParticipantData.year || null,
             role: newParticipantData.role || null,
        };
        setParticipants([...participants, newParticipant]);
    };

    const handleConfirmSave = async () => {
        if (!eventId) { setError("Event ID is missing."); return; }
        setIsSaving(true);
        setError(null);
        try {
            const success = await simulateSaveParticipants(eventId, participants);
            if(success){
                alert('Participants saved successfully!');
                router.push(`/events/${eventId}`);
            } else {
                 throw new Error('Save operation did not report success.');
            }
        } catch (err: any) {
            console.error("[ParticipantReviewUI] Failed to save participants:", err);
            setError(`Failed to save participants: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Review Imported Participants</h1>
            <p>Total participants in list: <strong>{participants.length}</strong></p>

            <button onClick={() => setIsModalOpen(true)}>
                + Add Participant Manually
            </button>

            <ParticipantsTable
                participants={participants}
                onDeleteParticipant={handleDeleteParticipant}
            />

            {error && (
                 <div style={{ color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb', padding: '10px', marginTop: '15px', border: '1px solid', borderRadius: '4px' }}>
                    <strong>Error:</strong> {error}
                 </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                 <button
                    onClick={() => { if (window.confirm("Are you sure you want to cancel?")) { router.back(); } }}
                    disabled={isSaving}
                 >
                    Cancel Review
                 </button>
                 <button
                    onClick={handleConfirmSave}
                    disabled={isSaving || participants.length === 0}
                 >
                    {isSaving ? 'Saving...' : 'Confirm & Save Participants'}
                </button>
            </div>

            <AddParticipantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddParticipant} // Pass the updated handler
            />
        </div>
    );
};

export default ParticipantReviewUI;