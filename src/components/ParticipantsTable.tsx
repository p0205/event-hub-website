// src/components/ParticipantsTable.tsx

import React from 'react';
import { Participant } from '@/types/user'; // Adjust path

interface ParticipantsTableProps {
    participants: Participant[];
    onDeleteParticipant: (id: number | string) => void; // ID can be number or string
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({ participants, onDeleteParticipant }) => {

    if (!participants || participants.length === 0) {
        return <p style={{ marginTop: '20px', fontStyle: 'italic' }}>No participants available. Add participants manually or check import results.</p>;
    }

    return (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>No.</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Phone</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Gender</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Faculty</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Course</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Year</th>
                         <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Role</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((participant, index) => (
                        // Use participant.id for React key prop - must be unique and stable (number or string)
                        <tr key={participant.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.email}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.phoneNo || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.gender || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.faculty || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.course || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.year || '-'}</td>
                             <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.role || '-'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                <button
                                    onClick={() => onDeleteParticipant(participant.id)} // Call delete handler with participant's ID
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#dc3545', // Red color for delete
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.9em'
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ParticipantsTable;