import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = '1rem',
  className = '',
}) => {
  // Calculate grid template columns for each breakpoint
  const gridTemplateColumns = {
    xs: columns.xs ? `repeat(${columns.xs}, 1fr)` : 'repeat(1, 1fr)',
    sm: columns.sm ? `repeat(${columns.sm}, 1fr)` : 'repeat(2, 1fr)',
    md: columns.md ? `repeat(${columns.md}, 1fr)` : 'repeat(3, 1fr)',
    lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : 'repeat(4, 1fr)',
    xl: columns.xl ? `repeat(${columns.xl}, 1fr)` : 'repeat(4, 1fr)',
  };

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gap,
        gridTemplateColumns: gridTemplateColumns.xs,
        '@media (min-width: 480px)': {
          gridTemplateColumns: gridTemplateColumns.xs,
        },
        '@media (min-width: 640px)': {
          gridTemplateColumns: gridTemplateColumns.sm,
        },
        '@media (min-width: 768px)': {
          gridTemplateColumns: gridTemplateColumns.md,
        },
        '@media (min-width: 1024px)': {
          gridTemplateColumns: gridTemplateColumns.lg,
        },
        '@media (min-width: 1280px)': {
          gridTemplateColumns: gridTemplateColumns.xl,
        },
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;