// src/components/BudgetTable.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { createBudgetCategoryMap, EventBudget } from '@/types/event'; // adjust if needed
import eventBudgetService from '@/services/eventBudgetService';
import budgetCategoryService from '@/services/budgetCategoryService';

interface BudgetTableProps {
    budgets: EventBudget[];

}

const BudgetTable: React.FC<BudgetTableProps> = ({ budgets }) => {
    const [loading, setLoading] = useState(true);
    const [budgetCategoryMap, setBudgetCategoryMap] = useState<Map<number, string>>(new Map());
    const hasAmountSpent = budgets.some((budget) => budget.amountSpent !== null && budget.amountSpent !== undefined);

    useEffect(() => {
        const fetchBudgetCategories = async () => {
            try {
                const budgetCategories = await budgetCategoryService.fetchBudgetCategories();       
                setBudgetCategoryMap(createBudgetCategoryMap(budgetCategories));
            } catch (error) {
                console.error('Failed to fetch budget categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetCategories();
    }, []);

    if (loading) {
        return <div>Loading budget categories...</div>;
      }

      
      return (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead className="bg-gray-100">
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Category</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Allocated Amount (RM)</th>
                {hasAmountSpent && (
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Spent Amount (RM)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr key={index} className="border-t">
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    {budgetCategoryMap.get(Number(budget.budgetCategoryId)) || 'Unknown Category'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    {budget.amountAllocated}
                  </td>
                  {hasAmountSpent && (
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {typeof budget.amountSpent === 'number' ? budget.amountSpent.toFixed(2) : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
    
    export default BudgetTable;