"use client";
import budgetCategoryService from "@/services/budgetCategoryService";
import { BudgetCategory } from "@/types/event";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";
import BudgetCategoriesTable from "./BudgetCategoriesTable";
import styles from './budget.module.css';

export default function ManageBudgetPage() {
    const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Paging state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [offset, setOffset] = useState(0);

    // Fetch budgets on initial load
    useEffect(() => {
        fetchBudgets();
    }, [currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to the first page on page size change
    };

    
    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const data = await budgetCategoryService.fetchBudgetCategoriesByPage(currentPage, pageSize);
            setBudgets(data.content);
            setTotalItems(data.totalElements);
            setTotalPages(data.totalPages);
            setOffset(data.pageable.offset+1);
        } catch (error: any) {
            alert(error.message || "Failed to fetch budgets");
        } finally {
            setLoading(false);
        }
    };

    const handleAddBudget = async () => {
        if (!newBudgetName.trim()) {
            alert("Please enter a budget name");
            return;
        }

        try {
            setIsAdding(true);
            const existing = budgets.find(b =>
                b.name.toLowerCase() === newBudgetName.toLowerCase()
            );

            if (existing) {
                alert("Budget name already exists");
                return;
            }

            await budgetCategoryService.addBudgetCategory(newBudgetName);
            setNewBudgetName("");
            await fetchBudgets();
            alert("Budget added successfully");
        } catch (error: any) {
            alert(error.message || "Failed to add budget");
        } finally {
            setIsAdding(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchBudgets();
            return;
        }
        try {
            setIsSearching(true);
            const data = await budgetCategoryService.fetchBudgetCategoryByName(searchQuery);
            setBudgets(data);
        } catch (error: any) {
            alert(error.message || "Failed to search budgets");
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


    const handleDeleteBudget = async (id: number) => {
        if (!confirm("Are you sure you want to delete this budget?")) return;

        try {
            setLoading(true);
            await budgetCategoryService.deleteBudgetCategory(id);
            await fetchBudgets();
            alert("Budget is deleted successfully");
        } catch (error: any) {
            alert(error.message || "Failed to delete budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Budget Management</h1>
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search budgets..."
                        />
                        {isSearching && (
                            <FaSpinner className={styles.searchIcon} style={{ right: '1rem', left: 'auto' }} />
                        )}
                    </div>
                </div>

                <div className={styles.addBudgetContainer}>
                    <div className={styles.addBudgetForm}>
                        <input
                            type="text"
                            value={newBudgetName}
                            onChange={(e) => setNewBudgetName(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleAddBudget()}
                            placeholder="Enter new budget name"
                            className={styles.addBudgetInput}
                        />
                        <button
                            onClick={handleAddBudget}
                            disabled={isAdding}
                            className={styles.addButton}
                        >
                            {isAdding ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            Add Budget
                        </button>
                    </div>
                </div>

                
                    <BudgetCategoriesTable       
                        budgetCategories={budgets}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        offset={offset}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}   
                        handleDeleteBudget={handleDeleteBudget}
                    />
                
            </div>
        </div>
    );
}