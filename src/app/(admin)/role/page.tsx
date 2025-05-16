"use client";
import budgetCategoryService from "@/services/budgetCategoryService";
import roleService from "@/services/roleService";
import { Role } from "@/types/event";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";

export default function ManageBudgetPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch budgets on initial load
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await roleService.fetchRoles();
            setRoles(data);
        } catch (error: any) {
            alert(error.message || "Failed to fetch roles");
        } finally {
            setLoading(false);
        }
    };

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
            alert( `Role ${newRoleName} is added successfully`);
        } catch (error: any) {
            alert(error.message || "Failed to add role");
        } finally {
            setIsAdding(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchRoles();
            return;
        }
        try {
            setIsSearching(true);
            const data = await roleService.fetchRolesByName(searchQuery);
            setRoles(data);
        } catch (error: any) {
            alert(error.message || "Failed to search roles");
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch();
        }, 1000);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);


    const handleDeleteRole = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role?")) return;

        try {
            setLoading(true);
            await roleService.deleteRole(id);
            await fetchRoles();
            alert("Role is deleted successfully");
        } catch (error: any) {
            alert(error.message || "Failed to delete role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>

                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search roles..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        {isSearching && (
                            <FaSpinner className="absolute right-3 top-3 animate-spin text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handleAddRole()}
                        placeholder="Enter new role name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleAddRole}
                        disabled={isAdding}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isAdding ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                        Add Role
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <FaSpinner className="animate-spin text-2xl text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role Name
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((budget, index) => (
                                <tr key={budget.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {budget.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteRole(budget.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete budget"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {roles.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No role found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}