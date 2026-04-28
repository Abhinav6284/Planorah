import React from 'react';

const Card = React.forwardRef(
  ({ children, className = '', hoverable = false, ...props }, ref) => {
    const baseStyles = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md transition-all duration-200';

    const hoverStyles = hoverable
      ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600'
      : '';

    const cardClassName = `${baseStyles} ${hoverStyles} ${className}`.trim();

    return (
      <div ref={ref} className={cardClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
