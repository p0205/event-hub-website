// src/app/events/[id]/budget/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link'; // Keep Link if needed elsewhere, otherwise can be removed
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Import the ProgressBar component (using global CSS)
import ProgressBar from '@/components/ProgressBar';


// Assuming a CSS Module for budget page specific styles
import styles from './budget.module.css'; // Ensure this CSS module exists and is appropriate
// Import services (assuming they fetch EventBudget data without nested expenses)
// import { BudgetCategory } from '@/types/event'; // BudgetCategory might not be needed directly if fetched within eventBudget
import budgetCategoryService from '@/services/budgetCategoryService'; // Keep if used elsewhere, maybe for category names if not in EventBudget
import eventBudgetService from '@/services/eventBudgetService';
import { EventBudget } from '@/types/event';

export default function EventBudgetPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State ---
    const [eventBudgets, setEventBudgets] = useState<EventBudget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for managing the centralized "Add Expense" form (Modal)
    const [isAddExpenseFormOpen, setIsAddExpenseFormOpen] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState({
        categoryId: '', // ID of the EventBudget category to update
        description: '', // Still capture description for the API call
        amount: '',
        date: '' // Still capture date for the API call
    });
    // State for handling potential receipt file upload (for API call)
    const [newExpenseReceiptFile, setNewExpenseReceiptFile] = useState<File | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string | null>(null); // To show selected file name

    // --- Data Loading (Load event budgets) ---
    useEffect(() => {
        const loadBudgetData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch event budget data (assuming it returns EventBudget[] without nested expenses)
                const data = await eventBudgetService.getEventBudgets(Number(eventId));
                // Ensure amountAllocated is a number or '', and amountSpent is a number
                // --- Mapping step ---
                const mappedData = data.map(backendBudget => ({
                    // Generate a UUID for the frontend UI id
                    id: uuidv4(), // Assuming you use a library like uuid and import v4()
                    // Keep the backend's ID if you need it for updates/deletes later
                    backendId: backendBudget.id, // Assuming backend ID is 'id' property and is a number
                    amountAllocated: Number(backendBudget.amountAllocated), // Ensure correct types
                    amountSpent: Number(backendBudget.amountSpent),     // Ensure correct types
                    budgetCategoryId: backendBudget.budgetCategoryId,
                    budgetCategoryName: backendBudget.budgetCategoryName,
                    // Include nested expenses if your backend returns them and your interface expects it
                    // amountSpent: backendBudget.amountSpent, // If backend returns array of expenses
                }));
                // --------------------

                setEventBudgets(mappedData); 
                console.log("Event Budgets loaded:", data);

            } catch (e: any) {
                console.error("Error loading budget data:", e);
                setError(`Failed to load budget data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            loadBudgetData();
        }

    }, [eventId]);

    // --- Derived Data ---

    // Calculate total spent for each category and remaining balance
    // This calculation remains the same as it relies on eventBudget.amountSpent
    const categoryBudgetSummary = useMemo(() => {
        return eventBudgets.map(eventBudget => {
            const totalSpent = eventBudget.amountSpent; // Already cumulative
            const allocated = Number(eventBudget.amountAllocated) || 0;
            const remainingBalance = allocated - totalSpent;
            const percentageCheck = allocated > 0
                ? (totalSpent / allocated) * 100
                : (totalSpent > 0 ? 100 : 0); // Handle division by zero
            const exceeded = percentageCheck > 100;

            return {
                ...eventBudget,
                totalSpent,
                remainingBalance,
                exceeded,
                allocated: allocated, // Ensure allocated is a number for progress bar
            };
        });
    }, [eventBudgets]);

    // Calculate overall event budget summary
    // This calculation also remains largely the same
    const overallBudgetSummary = useMemo(() => {
        const totalAllocated = categoryBudgetSummary.reduce((sum, summary) => sum + summary.allocated, 0);
        const totalSpentAcrossAllCategories = categoryBudgetSummary.reduce((sum, summary) => sum + summary.totalSpent, 0);
        const overallRemaining = totalAllocated - totalSpentAcrossAllCategories;
        const overallPercentageCheck = totalAllocated > 0
            ? (totalSpentAcrossAllCategories / totalAllocated) * 100
            : (totalSpentAcrossAllCategories > 0 ? 100 : 0); // Handle division by zero
        const overallExceeded = overallPercentageCheck > 100;

        return {
            totalAllocated,
            totalSpent: totalSpentAcrossAllCategories,
            overallRemaining,
            overallExceeded,
        };
    }, [categoryBudgetSummary]);


    // --- Handlers ---

    // Handle opening/closing the centralized "Add Expense" modal
    const handleOpenAddExpenseForm = () => {
        if (eventBudgets.length > 0) {
            setIsAddExpenseFormOpen(true);
            // Reset form data and file when opening, pre-select first category if available
            setNewExpenseData({ categoryId: eventBudgets[0]?.id || '', description: '', amount: '', date: '' });
            setNewExpenseReceiptFile(null);
            setReceiptFileName(null);
        } else {
            // Maybe show a notification that no budget categories exist
            console.warn("Cannot add expense: No budget categories found.");
            alert("Please add budget categories before adding expenses."); // Simple feedback
        }
    };

    const handleCloseAddExpenseForm = () => {
        setIsAddExpenseFormOpen(false);
        // Reset form data when closing
        setNewExpenseData({ categoryId: '', description: '', amount: '', date: '' });
        setNewExpenseReceiptFile(null);
        setReceiptFileName(null);
    };

    // Handle input changes in the "Add Expense" form
    const handleNewExpenseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewExpenseData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle receipt file input change
    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setNewExpenseReceiptFile(file || null);
        setReceiptFileName(file ? file.name : null);
    };

    // Handle submitting a new expense
    const handleAddExpense = async () => {
        const { categoryId, description, amount, date } = newExpenseData;

        // Basic validation
        if (!categoryId || !description || !amount || !date) {
            alert("Please fill in all fields: Category, Description, Amount, and Date.");
            return;
        }
        const expenseAmount = parseFloat(amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            alert("Please enter a valid positive amount for the expense.");
            return;
        }

        const targetCategory = eventBudgets.find(budget => budget.id === categoryId);
        if (!targetCategory) {
            alert("Selected budget category not found.");
            return;
        }

        console.log(`Adding expense of ${expenseAmount} to category ${categoryId}`);
        console.log("Expense Details:", { description, amount, date });
        console.log("Receipt file selected:", newExpenseReceiptFile?.name || 'None');

        // --- TODO: Implement Backend API Call ---
        // This is where you would send the data to your backend.
        // The backend should:
        // 1. Record the expense details (description, amount, date, categoryId, eventId).
        // 2. Optionally handle the receipt file upload.
        // 3. **Crucially, update the `amountSpent` on the corresponding EventBudget record in the database.**
        // 4. Return the updated EventBudget object (or at least confirm success).

        // Example structure for API call using FormData for potential file upload:
        /*
        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('eventBudgetId', categoryId); // Or budgetCategoryId if using the number ID
        formData.append('description', description);
        formData.append('amount', expenseAmount.toString());
        formData.append('date', date);
        if (newExpenseReceiptFile) {
            formData.append('receipt', newExpenseReceiptFile);
        }

        try {
            // Replace with your actual API endpoint and service call
            const response = await fetch(`/api/events/${eventId}/expenses`, { // Example endpoint
                 method: 'POST',
                 body: formData,
             });

             if (!response.ok) {
                 throw new Error('Failed to add expense');
             }

             // const updatedBudget = await response.json(); // Assuming backend returns updated budget item

             // --- Frontend State Update (Optimistic or based on response) ---
             setEventBudgets(prevBudgets =>
                prevBudgets.map(budget =>
                    budget.id === categoryId
                        ? {
                              ...budget,
                              // Update amountSpent directly
                              amountSpent: (budget.amountSpent || 0) + expenseAmount,
                              // Or if backend returns the whole updated budget item:
                              // ...updatedBudget // Ensure interface matches
                          }
                        : budget
                )
            );

             // Reset form and close modal
             handleCloseAddExpenseForm();

        } catch (error: any) {
            console.error("Failed to add expense:", error);
            alert(`Error adding expense: ${error.message}`);
        }
        */

        // --- Simulate Frontend State Update (REMOVE THIS when API call is implemented) ---
        // This simulates the effect of the backend updating the amountSpent
        setEventBudgets(prevBudgets =>
            prevBudgets.map(budget =>
                budget.id === categoryId
                    ? {
                        ...budget,
                        amountSpent: (budget.amountSpent || 0) + expenseAmount,
                    }
                    : budget
            )
        );
        console.log('Simulated state update complete.');
        handleCloseAddExpenseForm(); // Close modal after simulated update
        // --- End Simulation ---

    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Budget</h2>
                <p className="loading-message">Loading budget data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Budget</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    const hasBudgetCategories = eventBudgets && eventBudgets.length > 0;
    console.log("Event Budgets:", eventBudgets);
    console.log("Category Budget Summary:", categoryBudgetSummary);

    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Budget</h2>

            {/* --- Add Expense Button (only if categories exist) --- */}
            {hasBudgetCategories && (
                <button
                    className="button-primary"
                    onClick={handleOpenAddExpenseForm}
                    style={{ marginBottom: '20px' }} // Add some space below button
                >
                    Add New Expense
                </button>
            )}

            {/* --- Overall Budget Summary --- */}
            {hasBudgetCategories && overallBudgetSummary.totalAllocated >= 0 && (
                <div className="form-container" style={{ marginBottom: '20px' }}> {/* Add spacing */}
                    <div className={styles["overall-summary-header"]}>
                        <h3>Overall Budget Summary</h3>
                    </div>
                    <div className={styles["overall-summary"]}>
                        <p><strong>Total Allocated:</strong> RM{overallBudgetSummary.totalAllocated.toFixed(2)}</p>
                        <p><strong>Total Spent:</strong> RM{overallBudgetSummary.totalSpent.toFixed(2)}</p>
                        <p><strong>Overall Remaining:</strong> RM{overallBudgetSummary.overallRemaining.toFixed(2)}</p>
                        {overallBudgetSummary.totalAllocated > 0 ? (
                            <ProgressBar spent={overallBudgetSummary.totalSpent} allocated={overallBudgetSummary.totalAllocated} />
                        ) : (
                            overallBudgetSummary.totalSpent === 0 && <p className="no-events-message">No budget allocated overall.</p>
                        )}
                        {overallBudgetSummary.overallExceeded && (
                            <p className="error-message" style={{ marginTop: '10px' }}>Warning: Overall budget exceeded!</p>
                        )}
                    </div>
                </div>
            )}

            {/* Message if no budget categories found */}
            {!hasBudgetCategories && !loading && !error && (
                <div className="form-container">
                    <p className="no-events-message">No budget categories found for this event. Add categories via the Event settings to track expenses.</p>
                </div>
            )}

            {/* --- Budget Categories Summary (No Detailed Expenses List) --- */}
            {hasBudgetCategories && (
                <div>
                    {categoryBudgetSummary.map(category => (
                        <div key={category.id} className="form-container" style={{ marginBottom: '20px' }}>
                            {/* Category Header & Summary */}
                            <div className={styles["category-header"]}>
                                <h3>{category.budgetCategoryName}</h3>
                                <div className={styles["category-summary"]}>
                                    <p>Allocated: RM{category.allocated.toFixed(2)}</p>
                                    <p>Spent: RM{category.totalSpent.toFixed(2)}</p>
                                    <p>Remaining: RM{category.remainingBalance.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Category Progress Bar */}
                            {category.allocated > 0 ? (
                                <ProgressBar spent={category.totalSpent} allocated={category.allocated} />
                            ) : (
                                category.totalSpent === 0 && <p className="no-events-message">No budget allocated for this category.</p>
                            )}
                            {category.exceeded && (
                                <p className="error-message" style={{ marginTop: '10px' }}>Warning: Budget for "{category.budgetCategoryName || 'this category'}" exceeded!</p>
                            )}

                            {/* --- Expense List Section Removed --- */}
                            {/* No table or list of individual expenses here anymore */}

                        </div>
                    ))}
                </div>
            )}

            {/* --- Modal Structure for Add New Expense Form (Remains the Same) --- */}
            {isAddExpenseFormOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseAddExpenseForm}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Expense</h3>
                            <button className={styles.closeButton} onClick={handleCloseAddExpenseForm}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-group"> {/* Use standard form-group class if defined globally */}
                                <label htmlFor="expenseCategory">Category:</label>
                                <select
                                    id="expenseCategory"
                                    name="categoryId" // This should match the key in newExpenseData
                                    value={newExpenseData.categoryId}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    className="form-input" // Add form styling class if available
                                >
                                    <option value="">-- Select Category --</option>
                                    {/* Map over eventBudgets directly */}
                                    {eventBudgets.map(budget => (
                                        <option key={budget.id} value={budget.id}>{budget.budgetCategoryName || `Category ${budget.id}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseDescription">Description:</label>
                                <input
                                    type="text"
                                    id="expenseDescription"
                                    name="description"
                                    value={newExpenseData.description}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseAmount">Amount (RM):</label>
                                <input
                                    type="number"
                                    id="expenseAmount"
                                    name="amount"
                                    value={newExpenseData.amount}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    step="0.01"
                                    min="0.01" // Expenses should likely be positive
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseDate">Date:</label>
                                <input
                                    type="date"
                                    id="expenseDate"
                                    name="date"
                                    value={newExpenseData.date}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseReceipt">Receipt (Optional):</label>
                                <input
                                    type="file"
                                    id="expenseReceipt"
                                    name="receipt"
                                    onChange={handleReceiptUpload}
                                    accept=".pdf, .jpg, .jpeg, .png"
                                    className="form-input" // Style file input if needed
                                />
                                {receiptFileName && (
                                    <p style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>Selected file: {receiptFileName}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <div className={styles["form-buttons"]}> {/* Check if this style exists/is needed */}
                                <button className="button-primary" onClick={handleAddExpense}>
                                    Save Expense
                                </button>
                                <button className="button-secondary" onClick={handleCloseAddExpenseForm} style={{ marginLeft: '10px' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}