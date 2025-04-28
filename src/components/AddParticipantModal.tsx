'use client';

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import userService from '@/services/userService';

interface Participant {
  id: number | string;
  name: string;
  email: string;
}

interface AddParticipantModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (selectedParticipant: Participant | null) => void;
}

const fakeParticipants: Participant[] = [
  { id: 1, name: 'Phoebe Kiew Jing Yao', email: 'b032210164@student.utem.edu.my' },
  { id: 2, name: 'Yvonne Ngu Rui Ging', email: 'b032210249@student.utem.edu.my' },
  { id: 3, name: 'John Doe', email: 'john@example.com' },
];

export default function AddParticipantModal({ open, onCancel, onConfirm }: AddParticipantModalProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (open) {
      setSearchText('');
      setSearchResults([]);
      setSelectedParticipant(null);
    }
  }, [open]);

  // Typing delay
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() !== '') {

        const fetchData = async () => {
            try {
            const data = await userService.getUserByName(searchText);
            setSearchResults(data);
            } catch (error) {
              console.error('Error fetching search results:', error);
              setSearchResults([]);
            } finally {
            }
          };
    
        fetchData();

      } 
      else {
        setSearchResults([]);
      }
    }, 500); // 500ms typing delay

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Participant</h3>
          <button onClick={onCancel} aria-label="Close modal">
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter participant's name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Search Results */}
        <div className="mb-4 max-h-40 overflow-y-auto">
          {searchText.trim() !== '' && searchResults.length === 0 && (
            <p className="text-gray-500 text-sm">No matching participants found.</p>
          )}
          {searchResults.map((participant) => (
            <div
              key={participant.id}
              className={`flex justify-between items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer ${
                selectedParticipant?.id === participant.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => setSelectedParticipant(participant)}
            >
              <div>
                <p className="font-medium">{participant.name}</p>
                <p className="text-sm text-gray-500">{participant.email}</p>
              </div>
              {selectedParticipant?.id === participant.id && (
                <span className="text-blue-600 font-semibold text-sm">Selected</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              selectedParticipant
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-300 cursor-not-allowed'
            }`}
            onClick={() => selectedParticipant && onConfirm(selectedParticipant)}
            disabled={!selectedParticipant}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
