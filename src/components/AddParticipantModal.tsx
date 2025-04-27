// src/components/AddParticipantModal.tsx

import React, { useState } from 'react';
import { Participant } from '@/types/user'; // Import Participant for Omit utility

interface AddParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Use Omit<Participant, 'id'> directly instead of NewParticipantFormData
    onSave: (participant: Omit<Participant, 'id'>) => void;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({ isOpen, onClose, onSave }) => {
    // State uses the shape that will be passed to onSave (Participant without id)
    const [formData, setFormData] = useState<Omit<Participant, 'id'>>({
        name: '',
        email: '',
        phoneNo: '',
        gender: '',
        faculty: '',
        course: '',
        year: '',
        role: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
             const dataToSave: Omit<Participant, 'id'> = {
                 ...formData,
                 phoneNo: formData.phoneNo || null,
                 gender: formData.gender || null,
                 faculty: formData.faculty || null,
                 course: formData.course || null,
                 year: formData.year || null,
                 role: formData.role || null,
             };
            onSave(dataToSave); // Call the onSave prop
            setFormData({ // Reset form
                name: '', email: '', phoneNo: '', gender: '',
                faculty: '', course: '', year: '', role: ''
            });
            onClose();
        }
    };

    return (
         <div style={{ /* ... modal overlay styles ... */ }}>
            <div style={{ /* ... modal content styles ... */ }}>
                <h2>Add New Participant</h2>
                <form onSubmit={handleSubmit}>
                    {/* Form Fields (same as before) */}
                    {/* Name (Required) */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
                    </div>
                    {/* Email (Required) */}
                     <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
                    </div>
                    {/* PhoneNo */}
                     <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="phoneNo">Phone:</label>
                        <input type="text" id="phoneNo" name="phoneNo" value={formData.phoneNo || ''} onChange={handleChange} />
                    </div>
                    {/* Gender */}
                     <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="gender">Gender:</label>
                        <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange}>
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                             <option value="Other">Other</option>
                             <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    {/* Faculty */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="faculty">Faculty:</label>
                        <input type="text" id="faculty" name="faculty" value={formData.faculty || ''} onChange={handleChange} />
                    </div>
                     {/* Course */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="course">Course:</label>
                        <input type="text" id="course" name="course" value={formData.course || ''} onChange={handleChange} />
                    </div>
                     {/* Year */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="year">Year:</label>
                        <input type="text" id="year" name="year" value={formData.year || ''} onChange={handleChange} />
                    </div>
                     {/* Role */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="role">Role:</label>
                         <input type="text" id="role" name="role" value={formData.role || ''} onChange={handleChange} />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save Participant</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddParticipantModal;