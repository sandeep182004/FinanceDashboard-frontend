/**
 * Card Component
 * Container for widget content
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md p-4 ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </div>
  );
};
