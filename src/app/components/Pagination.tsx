interface PaginationProps {
  currentPage: number; // zero-based
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const canPrev = currentPage > 0;
  const canNext = currentPage + 1 < totalPages;

  const goTo = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          onClick={() => goTo(0)}
          disabled={!canPrev}
        >
          First
        </button>
        <button
          className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          onClick={() => goTo(currentPage - 1)}
          disabled={!canPrev}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 px-2">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          onClick={() => goTo(currentPage + 1)}
          disabled={!canNext}
        >
          Next
        </button>
        <button
          className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          onClick={() => goTo(totalPages - 1)}
          disabled={!canNext}
        >
          Last
        </button>
      </div>
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page</span>
          <select
            className="px-2 py-1.5 border rounded-lg text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


