import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const getShapeClass = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 w-full';
      case 'rect':
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div className={`skeleton-shimmer ${getShapeClass()} ${className}`} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden p-3 flex flex-col gap-3 shadow-sm">
      <Skeleton className="aspect-square w-full" />
      <Skeleton variant="text" className="w-3/4 h-5 mt-1" />
      <div className="flex items-center gap-2 mt-1">
        <Skeleton variant="circle" className="w-4 h-4 shrink-0" />
        <Skeleton variant="text" className="w-1/3 h-3" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Skeleton variant="text" className="w-1/2 h-6" />
        <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 animate-pulse">
      {/* Left images */}
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-square w-full" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      </div>
      
      {/* Right details */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-full h-8" />
          <Skeleton variant="text" className="w-2/3 h-8" />
        </div>
        
        <div className="flex items-center gap-4">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>

        <Skeleton className="h-16 w-full" />
        
        <div className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-20 h-4" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-10" />
            <Skeleton className="w-16 h-10" />
            <Skeleton className="w-16 h-10" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton className="w-32 h-12" />
        </div>

        <div className="flex gap-4 mt-4">
          <Skeleton className="w-1/2 h-14" />
          <Skeleton className="w-1/2 h-14" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
