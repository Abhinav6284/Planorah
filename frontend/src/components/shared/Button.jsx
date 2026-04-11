import React from 'react';
import { Loader } from 'lucide-react';

const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variantStyles = {
      primary: 'bg-indigo-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 focus-visible:ring-indigo-500 dark:focus-visible:ring-blue-400',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600 focus-visible:ring-gray-400 dark:focus-visible:ring-slate-500',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-700 focus-visible:ring-gray-400 dark:focus-visible:ring-slate-500',
      danger: 'bg-error-500 text-white hover:bg-error-700 dark:hover:bg-error-700 focus-visible:ring-error-500',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg',
    };

    const buttonClassName = `
      ${baseStyles}
      ${variantStyles[variant] || variantStyles.primary}
      ${sizeStyles[size] || sizeStyles.md}
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClassName}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
