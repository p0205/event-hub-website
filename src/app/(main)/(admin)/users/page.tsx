'use client';

import React, { useEffect, useState } from 'react';
import styles from './users.module.css';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import { User } from '@/types/user';
import userService from '@/services/userService';
import UserAccountTable from '@/components/UserAccountTable';
import EditUserDialog from '@/components/EditUserDialog';
import CreateUserDialog from '@/components/CreateUserDialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Paging state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [offset, setOffset] = useState(0);

  // Fetch users on initial load and page change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers(currentPage, pageSize);
      setUsers(data.content);
      setTotalItems(data.totalElements);
      setTotalPages(data.totalPages);
      setOffset(data.pageable.offset);
    } catch (error: any) {
      alert(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to the first page on page size change
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    try {
      setIsSearching(true);
      const data = await userService.getUserByNameOrEmail(searchQuery);
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEditUser = (id: number | string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await userService.deleteUser(Number(id));
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleUserUpdate = () => {
    fetchUsers(); // Refresh the user list after update
  };

  const handleUserCreate = () => {
    fetchUsers(); // Refresh the user list after creation
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <FaUserPlus /> Add New User
        </button>
      </div>


      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                      <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
          >
            {isSearching ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>


      <UserAccountTable
        users={users}
        onDeleteUserAccount={handleDeleteUser}
        onEditUserAccount={handleEditUser}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        offset={offset}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdate={handleUserUpdate}
      />

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleUserCreate}
      />
    </div>
  );
}
