import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]';

const variants: Record<Variant, string> = {
  primary: 'bg-yellow-300 text-black hover:bg-yellow-400',
  secondary: 'bg-cyan-300 text-black hover:bg-cyan-400',
  outline: 'bg-white text-black hover:bg-pink-200',
  ghost: 'border-transparent bg-transparent text-black shadow-none hover:border-black hover:bg-yellow-200 hover:shadow-[3px_3px_0px_#000]',
  danger: 'bg-pink-400 text-black hover:bg-pink-500',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export function Button({ variant = 'primary', size = 'md', loading, fullWidth, className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
