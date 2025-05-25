// src/components/BudgetSummaryDonutChart.tsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface BudgetSummaryDonutChartProps {
  spent: number;
  remaining: number;
  label?: string;
}

const BudgetSummaryDonutChart: React.FC<BudgetSummaryDonutChartProps> = ({ 
  spent, 
  remaining, 
  label 
}) => {
  // Ensure spent and remaining are numbers and non-negative
  const validSpent = typeof spent === 'number' && !isNaN(spent) ? Math.max(0, spent) : 0;
  const validRemaining = typeof remaining === 'number' && !isNaN(remaining) ? Math.max(0, remaining) : 0;
  
  const total = validSpent + validRemaining;
  
  // Handle edge case where both values are 0
  if (total === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '0.875rem',
        fontStyle: 'italic'
      }}>
        No data available
      </div>
    );
  }

  const data = {
    labels: ['Spent', 'Remaining'],
    datasets: [
      {
        data: [validSpent, validRemaining],
        backgroundColor: [
          '#06b6d4', // Cyan for spent
          '#e2e8f0', // Light gray for remaining
        ],
        borderColor: [
          '#0891b2', // Darker cyan for spent border
          '#cbd5e1', // Darker gray for remaining border
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#0891b2',
          '#cbd5e1',
        ],
        hoverBorderColor: [
          '#0e7490',
          '#94a3b8',
        ],
        hoverBorderWidth: 3,
        cutout: '65%', // Creates the donut hole
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create a custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: RM${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const,
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 800,
    }
  };

  const remainingPercentage = total > 0 ? (((validRemaining / total)) * 100) : 0;

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Chart Container */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Doughnut data={data} options={options} />
        
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            lineHeight: '1.2'
          }}>
            {remainingPercentage.toFixed(0)}%
          </div>
          <div style={{
            fontSize: '0.625rem',
            color: '#64748b',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Remaining
          </div>
        </div>
      </div>

      {/* Custom Legend */}
      <div style={{ 
        display: 'flex', 
        gap: '16px',
        fontSize: '0.95rem',
        fontWeight: '500'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#06b6d4',
            borderRadius: '2px'
          }}></div>
          <span style={{ color: '#374151' }}>
            Spent: RM{validSpent.toFixed(2)}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px'
          }}></div>
          <span style={{ color: '#374151' }}>
            Remaining: RM{validRemaining.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryDonutChart;