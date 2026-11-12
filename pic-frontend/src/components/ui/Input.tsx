import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, hint, icon, rightElement, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          id={inputId}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-colors placeholder-gray-500
            border-black bg-white text-gray-950
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-black
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500 focus:ring-red-400' : 'hover:bg-yellow-50'}
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-900 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-xl border-2 border-black px-4 py-2.5 text-sm transition-colors placeholder-gray-500 bg-white text-gray-950
          focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-black resize-none
          ${error ? 'border-red-500 focus:ring-red-400' : 'hover:bg-yellow-50'}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
