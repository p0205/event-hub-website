"use client";
import roleService from "@/services/roleService";
import { Role } from "@/types/event";
import { useEffect, useState, useCallback } from "react";
import { FaPlus, FaSearch, FaSpinner } from "react-icons/fa";
import RolesTable from "./RolesTable";
import styles from './roles.module.css';

export default function ManageRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Paging state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [offset, setOffset] = useState(0);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await roleService.fetchRolesInPages(currentPage, pageSize);
            setRoles(data.content);
            setTotalItems(data.totalElements);
            setTotalPages(data.totalPages);
            setOffset(data.pageable.offset);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to fetch roles");
            } else {
                alert("Failed to fetch roles");
            }
        }
    }, [currentPage, pageSize]);

    // Fetch roles on initial load
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleAddRole = async () => {
        if (!newRoleName.trim()) {
            alert("Please enter a role name");
            return;
        }

        try {
            setIsAdding(true);
            const existing = roles.find(b =>
                b.name.toLowerCase() === newRoleName.toLowerCase()
            );

            if (existing) {
                alert("Role name already exists");
                return;
            }

            await roleService.addRole(newRoleName);
            setNewRoleName("");
            await fetchRoles();
            alert(`Role ${newRoleName} is added successfully`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to add role");
            } else {
                alert("Failed to add role");
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            fetchRoles();
            return;
        }
        try {
            setIsSearching(true);
            const data = await roleService.fetchRolesByName(searchQuery);
            setRoles(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to search roles");
            } else {
                alert("Failed to search roles");
            }
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, fetchRoles]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to the first page on page size change
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch();
        }, 1000);
        return () => clearTimeout(delayDebounce);
    }, [handleSearch]);

    const handleDeleteRole = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role?")) return;

        try {
            await roleService.deleteRole(id);
            await fetchRoles();
            alert("Role is deleted successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to delete role");
            } else {
                alert("Failed to delete role");
            }
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Role Management</h1>
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search roles..."
                        />
                        {isSearching && (
                            <FaSpinner className={styles.searchIcon} style={{ right: '1rem', left: 'auto' }} />
                        )}
                    </div>
                </div>

                <div className={styles.addRoleContainer}>
                    <div className={styles.addRoleForm}>
                        <input
                            type="text"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleAddRole()}
                            placeholder="Enter new role name"
                            className={styles.addRoleInput}
                        />
                        <button
                            onClick={handleAddRole}
                            disabled={isAdding}
                            className={styles.addButton}
                        >
                            {isAdding ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            Add Role
                        </button>
                    </div>
                </div>

                <RolesTable
                    roles={roles}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    totalPages={totalPages}
                    offset={offset}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    handleDeleteRole={handleDeleteRole}
                />
            </div>
        </div>
    );
}