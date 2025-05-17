// src/components/BudgetTable.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { EventBudget } from '@/types/event'; // adjust if needed

interface BudgetTableProps {
    budgets: EventBudget[];

}

const BudgetTable: React.FC<BudgetTableProps> = ({ budgets }) => {
    const hasAmountSpent = budgets.some((budget) => budget.amountSpent !== null && budget.amountSpent !== undefined);
      
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
                    {budget.budgetCategoryName || 'Unknown Category'}
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