// src/components/ParticipantReviewUI.tsx

'use client';

import React, { useState } from 'react';
import ParticipantsTable from '@/components/ParticipantsTable'; // Adjust path
import AddParticipantModal from '@/components/AddParticipantModal'; // Adjust path
import { User } from '@/types/user'; // Import Participant for Omit
import { useRouter } from 'next/navigation'; // For navigation after save

interface ParticipantReviewUIProps {
    initialParticipants: User[];
    eventId: string;
}

// --- Simulate API Call for SAVING ---
const simulateSaveParticipants = async (eventId: string, participants: User[]): Promise<boolean> => {
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

    const [participants, setParticipants] = useState<User[]>(initialParticipants);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const router = useRouter();

    const handleDeleteParticipant = (id: number | string) => {
        setParticipants(participants.filter(p => p.id !== id));
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
        } catch (err: unknown) {
            console.error("[ParticipantReviewUI] Failed to save participants:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to save participants: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleModalConfirm = (selectedParticipant: { id: number | string; name: string; email: string } | null) => {
        if (selectedParticipant) {
            const newParticipant: User = {
                id: selectedParticipant.id,
                name: selectedParticipant.name,
                email: selectedParticipant.email,
                phoneNo: null,
                gender: null,
                faculty: null,
                course: null,
                year: null,
                role: null,
            };
            setParticipants([...participants, newParticipant]);
        }
        setIsModalOpen(false);
    };

    const totalParticipants = participants.length;
    const totalPages = Math.ceil(totalParticipants / pageSize);
    const offset = currentPage * pageSize;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Review Imported Participants</h1>
            <p>Total participants in list: <strong>{participants.length}</strong></p>

            <button onClick={() => setIsModalOpen(true)}>
                + Add Participant Manually
            </button>

            <ParticipantsTable
                participants={participants.slice(offset, offset + pageSize)}
                onDeleteParticipant={handleDeleteParticipant}
                currentPage={currentPage}
                pageSize={pageSize}
                totalParticipants={totalParticipants}
                totalPages={totalPages}
                offset={offset}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
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
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
            />
        </div>
    );
};

export default ParticipantReviewUI;