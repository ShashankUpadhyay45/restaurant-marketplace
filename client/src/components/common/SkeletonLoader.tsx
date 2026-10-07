import React from 'react';

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs animate-pulse">
      <div className="h-48 bg-stone-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded-md w-3/4" />
        <div className="h-3 bg-stone-200 rounded-md w-1/2" />
        <div className="pt-2 flex justify-between">
          <div className="h-4 bg-stone-200 rounded-md w-1/4" />
          <div className="h-4 bg-stone-200 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-stone-100">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="p-4">
          <div className="h-4 bg-stone-200 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
};
