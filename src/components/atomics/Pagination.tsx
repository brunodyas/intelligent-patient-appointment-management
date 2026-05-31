import React from 'react';
import { ArrowLeft2Icon, ArrowRight2Icon } from '@/assets/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, className, onPageChange }) => {
  const getPaginationItems = () => {
    const items = [];
    const maxDisplayedPages = 5;

    if (totalPages <= maxDisplayedPages) {
      // If total pages are less or equal to maxDisplayedPages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push({ name: i.toString(), isActive: i === currentPage });
      }
    } else {
      // Display first page
      items.push({ name: '1', isActive: currentPage === 1 });

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) {
        startPage = 2;
        endPage = 3;
      } else if (currentPage === totalPages) {
        startPage = totalPages - 2;
        endPage = totalPages - 1;
      }

      // Display ellipsis if startPage is greater than 2
      if (startPage > 2) {
        items.push({ name: '...', isActive: false });
      }

      // Display page numbers between startPage and endPage
      for (let i = startPage; i <= endPage; i++) {
        items.push({ name: i.toString(), isActive: i === currentPage });
      }

      // Display ellipsis if endPage is less than totalPages - 1
      if (endPage < totalPages - 1) {
        items.push({ name: '...', isActive: false });
      }

      // Display last page
      items.push({ name: totalPages.toString(), isActive: currentPage === totalPages });
    }

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <div className={`Pagination flex w-full items-center justify-between border-t border-neutral-30 pt-4 max-sm:items-center max-md:flex-col max-sm:justify-center max-md:gap-2 ${className}`}>
      <h5 className='text-xs font-medium text-neutral-50'>
        Page {currentPage} of {totalPages}
      </h5>
      <div className='flex flex-row gap-3 max-sm:gap-1'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='flex h-8 w-8 max-sm:h-7 max-sm:w-7 items-center justify-center rounded-lg bg-transparent text-xs font-semibold leading-none text-neutral-60 transition-all duration-300 ease-out hover:bg-neutral-30 disabled:opacity-50'
        >
          <ArrowLeft2Icon className='h-4 w-4 stroke-2' />
        </button>
        {paginationItems.map((pagination, index) => (
          <button
            key={index}
            onClick={() => pagination.name !== '...' && onPageChange(Number(pagination.name))}
            disabled={pagination.name === '...'}
            className={`flex h-8 w-8 max-sm:h-7 max-sm:w-7 items-center justify-center rounded-lg ${pagination.isActive
              ? 'cursor-auto bg-active-surface text-active-main'
              : 'cursor-pointer bg-white text-neutral-60 hover:bg-neutral-30'
              } text-xs font-semibold leading-none transition-all duration-300 ease-out disabled:cursor-default disabled:bg-transparent`}
          >
            {pagination.name}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='flex h-8 w-8 max-sm:h-7 max-sm:w-7 items-center justify-center rounded-lg bg-transparent text-xs font-semibold leading-none text-neutral-60 transition-all duration-300 ease-out hover:bg-neutral-30 disabled:opacity-50'
        >
          <ArrowRight2Icon className='h-4 w-4 stroke-2' />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
