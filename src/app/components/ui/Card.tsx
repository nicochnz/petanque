import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-surface shadow-lg border border-light-dark hover:shadow-xl',
    primary: 'bg-primary text-light shadow-primary hover:shadow-lg',
    secondary: 'bg-secondary text-light shadow-secondary hover:shadow-lg'
  };
  
  const classes = cn(
    baseClasses,
    variants[variant],
    className
  );
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
