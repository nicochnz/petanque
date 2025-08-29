import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary' | 'outline-light';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-light hover:bg-primary-dark shadow-primary hover:shadow-lg',
    secondary: 'bg-secondary text-light hover:bg-secondary-dark shadow-secondary hover:shadow-lg',
    'outline-primary': 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-light',
    'outline-secondary': 'border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-light',
    'outline-light': 'border-2 border-light text-light bg-transparent hover:bg-light hover:text-primary'
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm rounded',
    md: 'px-6 py-3 rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
