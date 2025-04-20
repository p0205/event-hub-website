// src/components/ProgressBar.tsx
import React from 'react';
// Using global CSS class names, so no module import needed:


// Define the updated interface for component props
interface ProgressBarProps {
  spent: number;      // The amount spent
  allocated: number;  // The allocated amount
  label?: string;   // Optional custom label (overrides default value/total display)
}

// Component uses global CSS classes
const ProgressBar: React.FC<ProgressBarProps> = ({ spent, allocated, label }) => {
  // Ensure spent and allocated are numbers and non-negative
  const validSpent = typeof spent === 'number' && !isNaN(spent) ? Math.max(0, spent) : 0;
  const validAllocated = typeof allocated === 'number' && !isNaN(allocated) ? Math.max(0, allocated) : 0;

  // Calculate the percentage spent internally (used for bar width and color)
  const percentage = validAllocated > 0
    ? (validSpent / validAllocated) * 100
    : (validSpent > 0 ? 100 : 0); // If allocated is 0 but spent > 0, consider it 100%+


  // Calculate the width for the filled portion visually (cap at 100%)
  const fillWidth = Math.min(percentage, 100);

  // Determine the global CSS class for the color based on the calculated percentage
  const progressColorClass = percentage < 75
    ? 'progressGreen' // Global class name string
    : percentage <= 100
      ? 'progressOrange' // Global class name string
      : 'progressRed'; // Global class name string

  // Format the default label as "Value / Total" with 2 decimal places
  const defaultValueLabel = `$${validSpent.toFixed(2)} / $${validAllocated.toFixed(2)}`;


  return (
    // Use global class names directly as strings in className
    <div className="progressBarContainer">
      <div
        className={`progressBarFill ${progressColorClass}`} // Use global class names
        style={{ width: `${fillWidth}%` }} // Set the width dynamically using inline style
      ></div>
      {/* Display the calculated value/total label or a custom label if provided */}
      {/* Use global class name for the label */}
      <span className="progressBarLabel">{label !== undefined ? label : defaultValueLabel}</span>
    </div>
  );
};

export default ProgressBar;