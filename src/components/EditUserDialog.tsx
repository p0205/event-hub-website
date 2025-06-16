import React, { useState, useEffect } from 'react';
import { User, UserAccountStatus } from '@/types/user';
import userService from '@/services/userService';
import { X, User as UserIcon, Mail, Phone, GraduationCap, BookOpen, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface EditUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
    isOpen,
    onClose,
    user,
    onUpdate
}) => {
    const [formData, setFormData] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scrolling when dialog closes
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore scrolling
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !user || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log(formData.status);
            await userService.updateUser(Number(user.id), formData);
            toast.success(`User updated successfully!`);
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose} 
            />


            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
              
                <div className="bg-white px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <UserIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Edit User Information</h2>
                                <p className="text-gray-500 text-sm mt-1">Update user account details and settings</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Scrollable content area */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="px-8 py-6">
                        {/* Error message with enhanced styling */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                        >
                                           
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Mail className="w-5 h-5 mr-2 text-gray-600" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phoneNo"
                                                value={formData.phoneNo || ''}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Faculty</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="faculty"
                                                value={formData.faculty || ''}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                                placeholder="Enter faculty"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Course</label>
                                        <input
                                            type="text"
                                            name="course"
                                            value={formData.course || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                            placeholder="Enter course"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700">Academic Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="year"
                                                value={formData.year || ''}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                                placeholder="Enter academic year"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    Account Status
                                </h3>
                                <div className="space-y-2">
                                    <select
                                        name="status"
                                        value={formData.status || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-medium bg-white"
                                    >
                                        <option value={UserAccountStatus.ACTIVE}>Active</option>
                                        <option value={UserAccountStatus.INACTIVE}>Inactive</option>
                                    
                                        <option value={UserAccountStatus.SUSPENDED}>Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced footer with professional styling */}
                <div className="bg-white px-8 py-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Changes...
                            </div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserDialog;