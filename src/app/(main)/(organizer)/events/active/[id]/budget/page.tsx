// src/app/events/[id]/budget/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid
import ProgressBar from '@/components/ProgressBar';
import styles from './budget.module.css';
import eventBudgetService from '@/services/eventBudgetService';
import { AddExpensePayload, EventBudget } from '@/types/event'; // Assuming EventBudget type is correct
import BudgetSummaryDonutChart from '@/components/BudgetSummaryDonutChart';

export default function EventBudgetPage() {
    const params = useParams();
    const eventId = params.id as string; // eventId will be a string, convert to number for service calls

    // --- State ---
    const [eventBudgets, setEventBudgets] = useState<EventBudget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for managing the centralized "Add Expense" form (Modal)
    const [isAddExpenseFormOpen, setIsAddExpenseFormOpen] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState({
        budgetCategoryId: '',
        amount: ''
    });
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
    const [addExpenseError, setAddExpenseError] = useState<string | null>(null);


    // --- Data Loading ---
    const loadBudgetData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await eventBudgetService.getEventBudgets(Number(eventId));

            // Map backend data to your frontend EventBudget structure
            const mappedData = data.map(backendBudget => ({
                // Ensure your EventBudget interface can accommodate these fields
                id: uuidv4(), // Frontend-specific ID
                backendId: backendBudget.id, // The actual ID from the backend's Event_Budget table
                amountAllocated: Number(backendBudget.amountAllocated),
                amountSpent: Number(backendBudget.amountSpent),
                budgetCategoryId: backendBudget.budgetCategoryId,
                budgetCategoryName: backendBudget.budgetCategoryName,
            }));

            setEventBudgets(mappedData);
            console.log("Event Budgets loaded:", data);
        } catch (e: any) {
            console.error("Error loading budget data:", e);
            setError(`Failed to load budget data: ${e.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            loadBudgetData();
        }
    }, [eventId]); // Dependency on eventId ensures re-fetch if ID changes

    // --- Derived Data ---
    const categoryBudgetSummary = useMemo(() => {
        return eventBudgets.map(eventBudget => {
            const totalSpent = eventBudget.amountSpent;
            const allocated = Number(eventBudget.amountAllocated) || 0;
            const remainingBalance = allocated - totalSpent;
            const percentageCheck = allocated > 0
                ? (totalSpent / allocated) * 100
                : (totalSpent > 0 ? 100 : 0); // If allocated is 0 but spent > 0, it's 100%+ used
            const exceeded = percentageCheck > 100;

            return {
                ...eventBudget,
                totalSpent,
                remainingBalance,
                exceeded,
                allocated: allocated,
                percentage: Math.min(percentageCheck, 100), // Cap percentage at 100 for ProgressBar display
            };
        }).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by most spent to least spent
    }, [eventBudgets]);

    const overallBudgetSummary = useMemo(() => {
        const totalAllocated = categoryBudgetSummary.reduce((sum, summary) => sum + summary.allocated, 0);
        const totalSpentAcrossAllCategories = categoryBudgetSummary.reduce((sum, summary) => sum + summary.totalSpent, 0);
        const overallRemaining = totalAllocated - totalSpentAcrossAllCategories;
        const overallPercentageCheck = totalAllocated > 0
            ? (totalSpentAcrossAllCategories / totalAllocated) * 100
            : (totalSpentAcrossAllCategories > 0 ? 100 : 0);
        const overallExceeded = overallPercentageCheck > 100;

        return {
            totalAllocated,
            totalSpent: totalSpentAcrossAllCategories,
            overallRemaining,
            overallExceeded,
            percentage: overallPercentageCheck,
        };
    }, [categoryBudgetSummary]);

    // --- Helper Functions ---
    const getBudgetStatus = (percentage: number) => {
        if (percentage <= 70) return { status: 'good', label: 'On Track' };
        if (percentage <= 90) return { status: 'warning', label: 'Watch Closely' };
        if (percentage <= 100) return { status: 'warning', label: 'Nearly Exceeded' };
        return { status: 'exceeded', label: 'Over Budget' };
    };

    const formatCurrency = (amount: number) => {
        return `RM${amount.toFixed(2)}`;
    };

    // --- Handlers ---
    const handleOpenAddExpenseForm = () => {
        // Only open if there are budget categories to select from
        if (eventBudgets.length > 0) {
            setIsAddExpenseFormOpen(true);
            setNewExpenseData({
                budgetCategoryId: '',
                amount: '',
            });
            setAddExpenseError(null); // Clear previous errors
        } else {
            alert("Please add budget categories before adding expenses. You can usually do this in Event Settings.");
        }
    };

    const handleCloseAddExpenseForm = () => {
        setIsAddExpenseFormOpen(false);
        setNewExpenseData({ budgetCategoryId: '', amount: '' });
        setAddExpenseError(null);
    };

    const handleNewExpenseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(name);
        console.log(value);
        setNewExpenseData(prevData => ({ ...prevData, [name]: value }));
        console.log("New Expense");
        console.log(newExpenseData.budgetCategoryId);
        console.log(newExpenseData.amount);
    };

    const handleAddExpense = async () => {
        // Basic frontend validation
        if (!newExpenseData?.amount || !newExpenseData.budgetCategoryId) {
            setAddExpenseError("Please select a category and enter an amount.");
            return;
        }

        const expenseAmount = parseFloat(newExpenseData.amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            setAddExpenseError("Please enter a valid positive amount for the expense.");
            return;
        }

        // Ensure categoryId is a number for the service call
        const selectedBudgetCategoryId = Number(newExpenseData.budgetCategoryId); // Convert string to number

        if (isNaN(selectedBudgetCategoryId)) {
            setAddExpenseError("Invalid category selected.");
            return;
        }

        const payload: AddExpensePayload = {
            budgetCategoryId: selectedBudgetCategoryId,
            amount: expenseAmount, // Convert to number for the payload to the service
            // Add description if you have it in your form and AddExpensePayload
        };

        setIsSubmittingExpense(true);
        setAddExpenseError(null); // Clear previous errors

        try {
            await eventBudgetService.recordExpense(Number(eventId), payload);

            // After successful API call, reload budget data to reflect changes
            await loadBudgetData();

            handleCloseAddExpenseForm(); // Close modal on success
            alert('Expense recorded successfully!'); // Provide user feedback
        } catch (e: any) {
            console.error("Failed to record expense:", e);
            setAddExpenseError(e.message || "Failed to record expense.");
        } finally {
            setIsSubmittingExpense(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <h3>Loading Budget Data</h3>
                    <p>Please wait while we fetch your budget information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <div className={styles['empty-state']}>
                    <div className={styles['empty-state-icon']}>⚠️</div>
                    <h3>Error Loading Budget</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const hasBudgetCategories = eventBudgets && eventBudgets.length > 0;

    return (
        <div className="page-content-wrapper">
            {/* --- Professional Page Header --- */}
            <div className='page-header'>
                <div className={'page-title-section'}>
                    <h2>Budget</h2>
                    <p className={'page-subtitle'}>
                        Track and manage your event expenses across all categories
                    </p>
                </div>
                {hasBudgetCategories && ( // Only show button if there are categories to add expenses to
                    <button
                        className={styles['add-expense-button']}
                        onClick={handleOpenAddExpenseForm}
                        title="Add New Expense"
                        disabled={isSubmittingExpense} // Disable button if expense is being submitted
                    >
                        +
                    </button>
                )}
            </div>

            {/* --- Overall Budget Summary --- */}
            {hasBudgetCategories && overallBudgetSummary.totalAllocated >= 0 && (
                <div className={styles['overall-budget-card']}>
                    <div className={styles['overall-summary-header']}>
                        <h3>Overall Budget Summary</h3>
                    </div>

                    <div className={styles['overall-summary']}>

                        <div className={styles['summary-section']}>

                            <div className={styles['summary-metrics']}>
                                <div className={`${styles['metric-item']} ${styles['metric-allocated']}`}>
                                    <div className={styles['metric-label']}>Total Allocated</div>
                                    <div className={styles['metric-value']}>
                                        {formatCurrency(overallBudgetSummary.totalAllocated)}
                                    </div>
                                </div>

                                <div className={`${styles['metric-item']} ${styles['metric-spent']}`}>
                                    <div className={styles['metric-label']}>Total Spent</div>
                                    <div className={styles['metric-value']}>
                                        {formatCurrency(overallBudgetSummary.totalSpent)}
                                    </div>
                                </div>

                                <div className={`${styles['metric-item']} ${styles['metric-remaining']} ${overallBudgetSummary.overallRemaining < 0 ? styles['negative'] : ''}`}>
                                    <div className={styles['metric-label']}>Remaining</div>
                                    <div className={styles['metric-value']}>
                                        {formatCurrency(overallBudgetSummary.overallRemaining)}
                                    </div>
                                </div>
                            </div>

                            {overallBudgetSummary.overallExceeded && (
                                <div className={styles['budget-exceeded-warning']}>
                                    Overall budget has been exceeded by {formatCurrency(Math.abs(overallBudgetSummary.overallRemaining))}
                                </div>
                            )}
                        </div>

                        <div className={styles['chart-section']}>
                            {overallBudgetSummary.totalAllocated > 0 ? (
                                <div className={styles['chart-container']}>
                                    <BudgetSummaryDonutChart
                                        spent={overallBudgetSummary.totalSpent}
                                        remaining={Math.max(0, overallBudgetSummary.overallRemaining)}
                                    />
                                </div>
                            ) : (
                                <p className={styles['no-chart-message']}>No budget allocated to display chart.</p>
                            )}

                            <div className={styles['category-breakdown']}>
                                <h4>Category Breakdown</h4>
                                <div className={styles['category-list']}>
                                    {categoryBudgetSummary.length > 0 ? (
                                        categoryBudgetSummary.slice(0, 5).map(category => (
                                            <div key={category.id} className={styles['category-item']}>
                                                <div className={styles['category-name']}>
                                                    {category.budgetCategoryName}
                                                </div>
                                                <div className={styles['category-amount']}>
                                                    {formatCurrency(category.totalSpent)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles['no-category-data']}>No expenses recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Empty State for No Budget Categories --- */}
            {!hasBudgetCategories && !loading && !error && (
                <div className={styles['empty-state']}>
                    <div className={styles['empty-state-icon']}>📊</div>
                    <h3>No Budget Found</h3>
                    
                </div>
            )}

            {/* --- Budget Categories --- */}
            {hasBudgetCategories && (
                <div>
                    {categoryBudgetSummary.map(category => {
                        const statusInfo = getBudgetStatus(category.percentage); // Removed as it's not used in display currently

                        return (
                            <div key={category.id} className={styles['category-card']}>
                                <div className={styles['category-header']}>
                                    <div className={styles['category-title']}>
                                        <h3>{category.budgetCategoryName}</h3>
                                    </div>

                                    <div className={styles['category-summary']}>
                                        <div className={`${styles['summary-item']} ${styles['summary-allocated']}`}>
                                            <div className={styles['summary-label']}>Allocated</div>
                                            <div className={styles['summary-value']}>
                                                {formatCurrency(category.allocated)}
                                            </div>
                                        </div>

                                        <div className={`${styles['summary-item']} ${styles['summary-spent']}`}>
                                            <div className={styles['summary-label']}>Spent</div>
                                            <div className={styles['summary-value']}>
                                                {formatCurrency(category.totalSpent)}
                                            </div>
                                        </div>

                                        <div className={`${styles['summary-item']} ${styles['summary-remaining']} ${category.remainingBalance < 0 ? styles['negative'] : ''}`}>
                                            <div className={styles['summary-label']}>Remaining</div>
                                            <div className={styles['summary-value']}>
                                                {formatCurrency(category.remainingBalance)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Section */}
                                <div className={styles['progress-section']}>
                                    <div className={styles['progress-header']}>
                                        <span className={styles['progress-label']}>Budget Usage</span>
                                        <span className={styles['progress-percentage']}>
                                            {category.percentage.toFixed(1)}%
                                        </span>
                                    </div>

                                    {category.allocated > 0 ? (
                                        <ProgressBar spent={category.totalSpent} allocated={category.allocated} />
                                    ) : (
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                                            No budget allocated for this category
                                        </p>
                                    )}
                                </div>

                                {category.exceeded && (
                                    <div className={styles['budget-exceeded-warning']}>
                                        Budget exceeded by {formatCurrency(Math.abs(category.remainingBalance))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- Modal for Add New Expense --- */}
            {isAddExpenseFormOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseAddExpenseForm}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Expense</h3>
                            <button className={styles.closeButton} onClick={handleCloseAddExpenseForm}>
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className="form-group">
                                <label htmlFor="expenseCategory">
                                    Category <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    id="expenseCategory"
                                    name="budgetCategoryId"
                                    value={newExpenseData.budgetCategoryId ?? ''}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    className="form-input"
                                    disabled={isSubmittingExpense} // Disable while submitting
                                >
                                    <option value="">-- Select Category --</option>
                                    {eventBudgets.map(budget => (
                                        // Use budget.budgetCategoryId for the value, as that's what the backend expects
                                        <option key={budget.id} value={budget.budgetCategoryId?.toString()}>
                                            {budget.budgetCategoryName || `Category ${budget.budgetCategoryId}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="expenseAmount">
                                    Amount (RM) <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    id="expenseAmount"
                                    name="amount"
                                    value={newExpenseData?.amount}
                                    onChange={handleNewExpenseInputChange}
                                    required
                                    step="0.01"
                                    min="0.01"
                                    className="form-input"
                                    placeholder="0.00"
                                    disabled={isSubmittingExpense} // Disable while submitting
                                />
                            </div>

                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles['form-buttons']}>
                                <button
                                    className="button-secondary"
                                    onClick={handleCloseAddExpenseForm}
                                    disabled={isSubmittingExpense} // Disable while submitting
                                >
                                    Cancel
                                </button>
                                <button
                                    className="button-primary"
                                    onClick={handleAddExpense}
                                    disabled={isSubmittingExpense} // Disable while submitting
                                >
                                    {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </div>
                        {addExpenseError && <p className="error-message" style={{ textAlign: 'center', marginTop: '10px' }}>{addExpenseError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}