// src/app/events/[id]/budget/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Import the ProgressBar component (using global CSS)
import ProgressBar from '@/components/ProgressBar';


// Assuming data structures for Budget Category and Expense
interface BudgetCategory {
    id: string;
    name: string;
    allocatedAmount: number; // Fixed amount
    expenses: Expense[]; // Assuming expenses are nested for simplicity in frontend state
}

interface Expense {
    id: string;
    categoryId: string; // Link back to the category
    description: string; // What the expense was for
    amount: number;
    date: string; // When the expense occurred (ISO string or similar)
    receiptUrl?: string; // URL to the uploaded receipt (if applicable)
    // Add other relevant fields
}


// Assuming a CSS Module for budget page specific styles
import styles from './budget.module.css'; // Create this CSS module


// --- Define Mock Budget Data ---
const mockBudgetCategories: BudgetCategory[] = [
    {
        id: 'cat-venue',
        name: 'Venue Rental',
        allocatedAmount: 5000.00,
        expenses: [
            { id: 'exp-v1', categoryId: 'cat-venue', description: 'Main hall rental fee', amount: 4500.00, date: '2025-04-15', receiptUrl: '/mock-receipts/venue-rental.pdf' },
            { id: 'exp-v2', categoryId: 'cat-venue', description: 'Cleaning service', amount: 250.00, date: '2025-04-20' },
        ]
    },
    {
        id: 'cat-catering',
        name: 'Catering',
        allocatedAmount: 3000.00,
        expenses: [
            { id: 'exp-c1', categoryId: 'cat-catering', description: 'Lunch for 50 people', amount: 1500.00, date: '2025-04-20' },
            { id: 'exp-c2', categoryId: 'cat-catering', description: 'Coffee break snacks', amount: 300.00, date: '2025-04-20' },
        ]
    },
    {
        id: 'cat-marketing',
        name: 'Marketing & Promotion',
        allocatedAmount: 1000.00,
        expenses: [
            { id: 'exp-m1', categoryId: 'cat-marketing', description: 'Social media ads', amount: 400.00, date: '2025-04-10' },
            { id: 'exp-m2', categoryId: 'cat-marketing', description: 'Flyer printing', amount: 200.00, date: '2025-04-05' },
             { id: 'exp-m3', categoryId: 'cat-marketing', description: 'Exceeded budget item', amount: 500.00, date: '2025-04-22' }, // Expense to exceed budget
        ]
    },
     {
        id: 'cat-misc',
        name: 'Miscellaneous',
        allocatedAmount: 500.00,
        expenses: [
             // No expenses yet in this category
        ]
    }
];
// --- End Mock Budget Data ---


export default function EventBudgetPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State ---
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for managing the centralized "Add Expense" form
    const [isAddExpenseFormOpen, setIsAddExpenseFormOpen] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState({
        categoryId: '', // Add categoryId to form state
        description: '',
        amount: '',
        date: ''
    });
    // State for handling potential receipt file upload
    const [newExpenseReceiptFile, setNewExpenseReceiptFile] = useState<File | null>(null);
     const [receiptFileName, setReceiptFileName] = useState<string | null>(null); // To show selected file name


    // --- Data Loading (using Mock Data) ---
    useEffect(() => {
        const loadMockBudgetData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate data loading delay (optional)

                // Use mock data directly
                const data: BudgetCategory[] = mockBudgetCategories;
                setBudgetCategories(data);

            } catch (e: any) {
                console.error("Error loading mock budget data:", e);
                setError(`Failed to load mock budget data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockBudgetData();

    }, [eventId]);


    // --- Derived Data ---

    // Calculate total spent for each category and remaining balance
    const categoryBudgetSummary = useMemo(() => {
        return budgetCategories.map(category => {
            const totalSpent = category.expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const remainingBalance = category.allocatedAmount - totalSpent;
             // Percentage calculation is now handled inside the ProgressBar component
             // We still need the flag for checking if the budget is exceeded
            const percentageCheck = category.allocatedAmount > 0
                ? (totalSpent / category.allocatedAmount) * 100
                : (totalSpent > 0 ? 100 : 0);
            const exceeded = percentageCheck > 100;

            return {
                ...category,
                totalSpent,
                remainingBalance,
                exceeded, // Include the exceeded flag
            };
        });
    }, [budgetCategories]);

    // Calculate overall event budget summary
    const overallBudgetSummary = useMemo(() => {
        const totalAllocated = budgetCategories.reduce((sum, category) => sum + category.allocatedAmount, 0);
        // Sum totalSpent from categoryBudgetSummary to use the already calculated values
        const totalSpentAcrossAllCategories = categoryBudgetSummary.reduce((sum, summary) => sum + summary.totalSpent, 0);
        const overallRemaining = totalAllocated - totalSpentAcrossAllCategories;
         // Percentage calculation is now handled inside the ProgressBar component
         // We still need the flag for checking if the overall budget is exceeded
         const overallPercentageCheck = totalAllocated > 0
             ? (totalSpentAcrossAllCategories / totalAllocated) * 100
             : (totalSpentAcrossAllCategories > 0 ? 100 : 0);
        const overallExceeded = overallPercentageCheck > 100;

        return {
            totalAllocated,
            totalSpent: totalSpentAcrossAllCategories,
            overallRemaining,
             overallExceeded, // Include the overallExceeded flag
        };
    }, [budgetCategories, categoryBudgetSummary]);


    // --- Handlers ---

    // Handle opening/closing the centralized "Add Expense" form (now a modal)
    const handleOpenAddExpenseForm = () => {
        // Check if there are categories available before opening the form
        if (budgetCategories.length > 0) {
            setIsAddExpenseFormOpen(true);
            // Reset form data and file when opening
            // Pre-select the first category if available
            setNewExpenseData({ categoryId: budgetCategories[0]?.id || '', description: '', amount: '', date: '' });
            setNewExpenseReceiptFile(null);
            setReceiptFileName(null);
        } else {
            console.warn("Cannot add expense: No budget categories found.");
            // TODO: Show a user-friendly message indicating no categories exist
        }
    };

    const handleCloseAddExpenseForm = () => {
        setIsAddExpenseFormOpen(false);
        // Optionally reset form data when closing
        setNewExpenseData({ categoryId: '', description: '', amount: '', date: '' });
        setNewExpenseReceiptFile(null);
        setReceiptFileName(null);
    };


    // Handle input changes in the "Add Expense" form
    const handleNewExpenseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // Accept SelectElement too
        const { name, value } = e.target;
        setNewExpenseData(prevData => ({ ...prevData, [name]: value }));
    };

     // Handle receipt file input change
    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setNewExpenseReceiptFile(file || null);
        setReceiptFileName(file ? file.name : null);
    };


    // Handle submitting a new expense (Simulated with state update)
    const handleAddExpense = async () => { // Removed categoryId parameter
        const { categoryId, description, amount, date } = newExpenseData; // Get categoryId from state

        // Basic validation
        if (!categoryId || !description || !amount || !date) {
            console.error("Category, Description, Amount, and Date are required for a new expense.");
            // TODO: Show user feedback (e.g., a toast notification or error message in the form)
            return;
        }
        const expenseAmount = parseFloat(amount);
         if (isNaN(expenseAmount) || expenseAmount <= 0) {
             console.error("Invalid expense amount.");
             // TODO: Show user feedback
             return;
         }

        console.log(`Simulating adding expense to category ${categoryId}:`, newExpenseData);
        console.log("Simulated receipt file:", newExpenseReceiptFile);

        // TODO: Implement API call to add a new expense.
        // This API call needs to handle file upload if newExpenseReceiptFile is not null.
        // A FormData object is typically used for sending files with other data.
        // Example (conceptual):
        // const formData = new FormData();
        // formData.append('categoryId', categoryId);
        // formData.append('description', description);
        // formData.append('amount', expenseAmount.toString());
        // formData.append('date', date);
        // if (newExpenseReceiptFile) {
        //     formData.append('receipt', newExpenseReceiptFile);
        // }
        // fetch(`/api/events/${eventId}/budget/expenses`, { // Centralized endpoint
        //     method: 'POST',
        //     body: formData, // Use FormData for file uploads
        // });


        // --- Simulate State Update for Adding Expense ---
        // In a real app, you would make an API call here first.
        // After successful API call (and getting the actual saved expense data including its ID and receiptUrl from backend):
        // You would update the state.
         setBudgetCategories(prevCategories =>
            prevCategories.map(category =>
                category.id === categoryId
                    ? {
                          ...category,
                          expenses: [
                              ...category.expenses,
                              {
                                  // Generate a mock ID for the new expense (replace with actual backend ID)
                                  id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                  categoryId: categoryId,
                                  description: description,
                                  amount: expenseAmount,
                                  date: newExpenseData.date,
                                  // Simulate a receipt URL if a file was selected (replace with actual backend URL)
                                  receiptUrl: newExpenseReceiptFile ? `simulated-upload-url/${newExpenseReceiptFile.name}` : undefined,
                              },
                          ],
                      }
                    : category
            )
        );
        // --- End Simulated State Update ---


        // Reset the form and close the modal after successful add (simulated)
        setNewExpenseData({ categoryId: '', description: '', amount: '', date: '' });
        setNewExpenseReceiptFile(null);
        setReceiptFileName(null);
        setIsAddExpenseFormOpen(false); // Close the modal

         // TODO: Add actual API call here and handle success/error (e.g., show error message)
    };

    // Handle deleting an expense (Simulated with state update)
    const handleDeleteExpense = async (categoryId: string, expenseId: string) => {
        console.log(`Simulating deleting expense ${expenseId} from category ${categoryId}`);

         // TODO: Add confirmation dialog before deleting

        // --- Simulate State Update for Deleting Expense ---
        // In a real app, you would make an API call here first.
        // After successful API call, update the state.
         setBudgetCategories(prevCategories =>
            prevCategories.map(category =>
                category.id === categoryId
                    ? {
                          ...category,
                          expenses: category.expenses.filter(expense => expense.id !== expenseId),
                      }
                    : category
            )
        );
        // --- End Simulated State Update ---

        // TODO: Add actual API call here and handle success/error
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

     const hasBudgetCategories = budgetCategories && budgetCategories.length > 0;


    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Budget</h2>
            {hasBudgetCategories && (
                            <button className="button-primary" onClick={handleOpenAddExpenseForm}>
                                Add New Expense
                            </button>
                         )}
            {/* --- Overall Budget Summary --- */}
             {hasBudgetCategories && overallBudgetSummary.totalAllocated >= 0 && ( // Show summary if categories exist and total allocated is non-negative
                <div className="form-container"> {/* Reuse form-container for card styling */}
                    <div className={styles["overall-summary-header"]}> {/* Flex container for title and button */}
                        <h3>Overall Budget Summary</h3>
                         {/* Centralized Add Expense Button - Only show if categories exist to add to */}
                        
                    </div>
                     <div className={styles["overall-summary"]}> {/* Use CSS Module for summary layout */}
                         <p><strong>Total Allocated:</strong> ${overallBudgetSummary.totalAllocated.toFixed(2)}</p>
                         <p><strong>Total Spent:</strong> ${overallBudgetSummary.totalSpent.toFixed(2)}</p>
                         <p><strong>Overall Remaining:</strong> ${overallBudgetSummary.overallRemaining.toFixed(2)}</p>
                          {/* Overall Progress Bar - Pass spent and allocated */}
                          {/* Show progress bar only if total allocated > 0 to avoid division by zero visual issues */}
                         {overallBudgetSummary.totalAllocated > 0 && (
                            <ProgressBar spent={overallBudgetSummary.totalSpent} allocated={overallBudgetSummary.totalAllocated} />
                         )}
                          {/* Optional: Message if total allocated is 0 */}
                         {overallBudgetSummary.totalAllocated === 0 && overallBudgetSummary.totalSpent === 0 && (
                            <p className="no-events-message">No budget allocated overall.</p>
                         )}
                          {/* Optional: Show exceeded message */}
                          {overallBudgetSummary.overallExceeded && (
                               <p className="error-message" style={{ marginTop: '10px' }}>Warning: Overall budget exceeded!</p>
                          )}
                     </div>
                </div>
             )}
              {/* Message if no budget categories found */}
              {!hasBudgetCategories && !loading && !error && (
                 <div className="form-container">
                     <p className="no-events-message">No budget categories found for this event. Cannot add expenses.</p> {/* Updated message */}
                 </div>
             )}

             {/* --- Budget Categories and Detailed Expenses --- */}
             {hasBudgetCategories && (
                 <div>
                     {categoryBudgetSummary.map(category => (
                         <div key={category.id} className="form-container" style={{ marginBottom: '20px' }}> {/* Reuse form-container for each category card, add space */}
                             {/* Category Header */}
                             <div className={styles["category-header"]}> {/* Use CSS Module for layout */}
                                 <h3>{category.name} Budget</h3>
                                 <div className={styles["category-summary"]}> {/* Use CSS Module for summary layout */}
                                     <p>Allocated: ${category.allocatedAmount.toFixed(2)}</p>
                                     <p>Spent: ${category.totalSpent.toFixed(2)}</p>
                                     <p>Remaining: ${category.remainingBalance.toFixed(2)}</p>
                                 </div>
                             </div>

                             {/* Category Progress Bar - Pass spent and allocated */}
                             {/* Show progress bar only if allocated amount > 0 to avoid division by zero visual issues */}
                             {category.allocatedAmount > 0 && (
                                 <ProgressBar spent={category.totalSpent} allocated={category.allocatedAmount} />
                             )}
                              {/* Optional: Message if allocated amount is 0 */}
                             {category.allocatedAmount === 0 && category.totalSpent === 0 && (
                                 <p className="no-events-message">No budget allocated for this category.</p>
                             )}
                              {/* Optional: Show exceeded message for category */}
                             {category.exceeded && (
                                  <p className="error-message" style={{ marginTop: '10px' }}>Warning: Budget for "{category.name}" exceeded!</p>
                             )}


                             {/* Expenses List */}
                             <h4>Expenses</h4>
                             {category.expenses.length === 0 ? (
                                 <p className={styles["no-expenses-message"]}>No expenses recorded for this category yet.</p>
                             ) : (
                                 <div className={styles["expenses-list-container"]}> 
                                     <table className={styles["expenses-table"]}> 
                                         <thead>
                                             <tr>
                                                 <th>Date</th>
                                                 <th>Description</th>
                                                 <th>Amount</th>
                                                  <th>Receipt</th> 
                                                 <th>Actions</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {category.expenses.map(expense => (
                                                 <tr key={expense.id}>
                                                     <td>{new Date(expense.date).toLocaleDateString()}</td>
                                                     <td>{expense.description}</td>
                                                     <td>${expense.amount.toFixed(2)}</td>
                                                      <td>
                                                         {expense.receiptUrl ? (
                                                             <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                         ) : (
                                                             '-'
                                                         )}
                                                      </td>
                                                     <td>
                                                         <button
                                                             className="button-secondary" // Reuse button style
                                                             onClick={() => handleDeleteExpense(category.id, expense.id)}
                                                         >
                                                             Delete
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             )}

                         </div>
                     ))}
                 </div>
             )}

            {/* --- Modal Structure for Add New Expense Form --- */}
            {isAddExpenseFormOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseAddExpenseForm}> {/* Overlay */}
                    {/* Modal Content (stopPropagation to prevent closing when clicking inside) */}
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Expense</h3>
                            <button className={styles.closeButton} onClick={handleCloseAddExpenseForm}>
                                &times; {/* Times symbol for a close button */}
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* The Centralized Add Expense Form Content */}
                            <div className={styles["centralized-add-expense-form"]}> {/* Reuse the form structure styles */}
                                <div className="form-group">
                                    <label htmlFor="expenseCategory">Category:</label>
                                    <select
                                        id="expenseCategory"
                                        name="categoryId"
                                        value={newExpenseData.categoryId}
                                        onChange={handleNewExpenseInputChange}
                                        required
                                    >
                                        <option value="">-- Select Category --</option>
                                        {budgetCategories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="expenseAmount">Amount ($):</label>
                                    <input
                                        type="number"
                                        id="expenseAmount"
                                        name="amount"
                                        value={newExpenseData.amount}
                                        onChange={handleNewExpenseInputChange}
                                        required
                                        step="0.01"
                                        min="0"
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
                                    />
                                    {receiptFileName && (
                                        <p style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>Selected file: {receiptFileName}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                             {/* Form Buttons - now in the modal footer */}
                           <div className={styles["form-buttons"]}> {/* Use CSS Module for button layout */}
                               <button className="button-primary" onClick={handleAddExpense}>
                                   Save Expense
                               </button>
                                {/* Cancel button */}
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