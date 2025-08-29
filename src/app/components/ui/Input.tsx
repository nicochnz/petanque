import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary';
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  variant = 'primary',
  label,
  error,
  className,
  ...props
}) => {
  const baseClasses = 'w-full border-2 p-3 rounded-xl transition-all duration-200 text-dark';
  
  const variants = {
    primary: 'border-light-dark focus:ring-2 focus:ring-primary focus:border-primary',
    secondary: 'border-light-dark focus:ring-2 focus:ring-secondary focus:border-secondary'
  };
  
  const classes = cn(
    baseClasses,
    variants[variant],
    error && 'border-error focus:ring-error focus:border-error',
    className
  );
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;
