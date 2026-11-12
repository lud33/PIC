import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-yellow-100 border-2 border-black border-dashed rounded-2xl">
      {icon && <div className="mb-4 text-pink-500">{icon}</div>}
      <h3 className="text-xl font-black text-gray-950 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-700 max-w-xs mb-6">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
