import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  
  return (
    <div className="px-6 py-4 border-t border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-4 bg-white mt-auto">
      <p className="text-[13px] font-medium text-[#64748b]">
        Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>
        
        {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${
              currentPage === page 
                ? 'bg-[#2563eb] text-white shadow-sm' 
                : 'border border-[#e2e8f0] text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button 
          onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
          disabled={currentPage >= safeTotalPages || totalCount === 0 || isLoading}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          <ChevronRight size={16} />
        </button>

        {onPageSizeChange && (
          <div className="ml-4 relative">
            <select 
              className="appearance-none bg-white border border-[#e2e8f0] rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={8}>8 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}
