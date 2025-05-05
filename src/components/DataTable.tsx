import '@/css/DataTable.scss'; // Ensure this path is correct for your project

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CustomMeta, Pagination } from '@/types/paginationTableType';

// Extend CustomMeta to include sortable property and sticky direction
interface ExtendedCustomMeta extends CustomMeta {
  sortable?: boolean;
  sticky?: 'left' | 'right'; // Ensure sticky is correctly typed
  width?: number | string; // Allow string widths (e.g., '150px') if needed, though number is safer for calculations
}

// Extend ColumnDef to use our extended meta
type ExtendedColumnDef<T> = ColumnDef<T, unknown> & {
  meta?: ExtendedCustomMeta;
};

interface DataTableProps<T> {
  id: string;
  columns: ExtendedColumnDef<T>[]; // Use extended column def
  data: T[];
  pagination?: Pagination; // Required for server-side pagination
  onPageChange?: (page: number, pageSize: number, sortBy?: SortingState) => void; // Pass pageSize and sort state
  onPageSizeChange?: (size: number, sortBy?: SortingState) => void; // Pass sort state
  onSortingChange?: (sortBy: SortingState) => void; // Callback for sorting changes (server-side)
  pageSizeOptions?: number[];
  initialPageSize?: number; // Use initialPageSize for clarity
  loading?: boolean;
  scrollHeight?: string; // Vertical scroll height
  scrollX?: boolean; // Enable horizontal scrolling and sticky columns
  headerBgColor?: string; // Keep for header background customization
  clientSidePagination?: boolean; // New prop to switch modes
  initialSorting?: SortingState; // Initial sorting state
}

// Memoized function to calculate visible pages (no change, seems fine)
const getVisiblePages = (currentPage: number, totalPages: number): (number | string)[] => {
  const maxPagesToShow = 7; // Max 7 items including dots

  if (totalPages <= maxPagesToShow) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const delta = 1; // Number of pages around current
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);
  const range: (number | string)[] = [];

  range.push(1); // Start with page 1

  if (left > 2) {
    range.push('...');
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) {
    range.push('...');
  }

  range.push(totalPages); // Add last page

  // Remove duplicates (if 1...2 3 4...totalPages becomes 1...4...totalPages)
  return range.filter((item, index, arr) => !(item === '...' && arr[index - 1] === '...'));
};

// Pagination info component
const TableInfo = memo(
  ({
    id,
    totalItems,
    from,
    to,
    disabled,
  }: {
    id: string;
    totalItems: number;
    from: number;
    to: number;
    disabled?: boolean;
  }) => (
    <div id={`${id}-info`} className={`data-table__info-text ${disabled ? 'text-muted' : ''}`}>
      {totalItems}件中{from}～{to}件目を表示 {/* {totalItems} items, displaying {from} to {to} */}
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.totalItems === nextProps.totalItems &&
      prevProps.from === nextProps.from &&
      prevProps.to === nextProps.to &&
      prevProps.disabled === nextProps.disabled // Include disabled in comparison
    );
  }
);

// Page size selector component
const PageSizeSelector = memo(
  ({
    id,
    currentPageSize,
    handlePageSizeChange,
    pageSizeOptions,
    disabled,
  }: {
    id: string;
    currentPageSize: number;
    handlePageSizeChange: (size: number) => void;
    pageSizeOptions: number[];
    disabled?: boolean;
  }) => (
    <div className="data-table__page-size-selector d-flex align-items-center">
      {/* Use Bootstrap classes */}
      画面行数:
      <select
        id={`${id}-page-length`}
        className="form-select form-select-sm w-auto ms-2" // Use Bootstrap form-select-sm and spacing
        value={currentPageSize}
        onChange={e => handlePageSizeChange(Number(e.target.value))}
        // disabled={disabled}
      >
        {pageSizeOptions.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  ),
  (prev, next) =>
    prev.currentPageSize === next.currentPageSize &&
    prev.disabled === next.disabled &&
    prev.pageSizeOptions.join(',') === next.pageSizeOptions.join(',') // Compare arrays by joining
);

// Navigation component
const PaginationNav = memo(
  ({
    id,
    currentPage,
    totalPages,
    handlePageChange,
    disabled,
  }: {
    id: string;
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    disabled?: boolean;
  }) => {
    const visiblePages = useMemo(() => getVisiblePages(currentPage, totalPages), [currentPage, totalPages]);

    // Prevent clicking disabled or active buttons
    const handleClick = (page: number | string) => {
      if (disabled || typeof page !== 'number' || page === currentPage) {
        return;
      }
      handlePageChange(page);
    };

    return (
      <nav id={`${id}-pagination`} className="data-table__pagination-nav">
        <ul className="pagination mb-0">
          {/* Use Bootstrap pagination-sm */}
          {/* Previous Page Button */}
          <li className={`page-item ${currentPage <= 1 || disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handleClick(currentPage - 1)}
              disabled={currentPage <= 1 || disabled}
              aria-label="Previous"
            >
              &laquo; {/* Left angle quote */}
            </button>
          </li>
          {/* Page Numbers and Dots */}
          {visiblePages.map((page, index) => (
            <li
              key={page === '...' ? `dots_${index}` : `page_${page}`}
              className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' || disabled ? 'disabled' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handleClick(page)}
                disabled={page === '...' || page === currentPage || disabled}
              >
                {page}
              </button>
            </li>
          ))}
          {/* Next Page Button */}
          <li className={`page-item ${currentPage >= totalPages || disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handleClick(currentPage + 1)}
              disabled={currentPage >= totalPages || disabled}
              aria-label="Next"
            >
              &raquo; {/* Right angle quote */}
            </button>
          </li>
        </ul>
      </nav>
    );
  },
  (prev, next) =>
    prev.currentPage === next.currentPage && prev.totalPages === next.totalPages && prev.disabled === next.disabled
);

const DataTable = <T,>({
  id,
  columns,
  data,
  pagination, // Server-side pagination info
  onPageChange, // Callback for server-side page change
  onPageSizeChange, // Callback for server-side page size change
  onSortingChange, // Callback for server-side sorting change
  pageSizeOptions = [20, 50, 100], // Added 10 as a common default
  initialPageSize = 20, // Renamed from pageSize for clarity
  loading = false,
  scrollHeight = '300px',
  scrollX = false, // New boolean prop for horizontal scroll
  headerBgColor = '#f8f9fa', // Default Bootstrap table header color
  clientSidePagination = false, // Default to server-side as per original code
  initialSorting = [], // Initial sorting state
}: DataTableProps<T>) => {
  // State derived from URL search params or initial props
  const [searchParams, setSearchParams] = useSearchParams();

  const [paginationState, setPaginationState] = useState<PaginationState>(() => {
    const pageIndexParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    const initialPageIndex = pageIndexParam ? Math.max(0, Number(pageIndexParam) - 1) : 0; // react-table is 0-indexed
    const initialSize = pageSizeParam ? Number(pageSizeParam) : initialPageSize;

    // Ensure initial size is in options, default to first option if not
    const effectivePageSize = pageSizeOptions.includes(initialSize) ? initialSize : pageSizeOptions[0];

    return {
      pageIndex: initialPageIndex,
      pageSize: effectivePageSize,
    };
  });

  // State for sorting
  const [sortingState, setSortingState] = useState<SortingState>(() => {
    const sortParam = searchParams.get('sort');
    return sortParam ? parseSortingParams(sortParam) : initialSorting;
  });

  // Refs for table and container
  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for sticky column positions
  const [stickyPositions, setStickyPositions] = useState<{
    left: Record<number, number>;
    right: Record<number, number>;
  }>({ left: {}, right: {} });

  // State to track scroll position for shadows (only relevant if scrollX is true)
  const [isScrolledLeft, setIsScrolledLeft] = useState(true);
  const [isScrolledRight, setIsScrolledRight] = useState(true); // Assume initially not scrollable right

  // Effect to calculate sticky positions IF scrollX is enabled
  useEffect(() => {
    const calculateStickyPositions = () => {
      if (!scrollX || !tableRef.current) {
        setStickyPositions({ left: {}, right: {} }); // Clear positions if scrollX is false
        setIsScrolledLeft(true); // Reset scroll state
        setIsScrolledRight(true);
        return;
      }

      const headerCells = tableRef.current.querySelectorAll('th');
      const leftPositions: Record<number, number> = {};
      const rightPositions: Record<number, number> = {};
      const leftStickyIndices: number[] = [];
      const rightStickyIndices: number[] = [];

      // Identify sticky columns and collect their widths
      columns.forEach((col, index) => {
        const meta = col.meta as ExtendedCustomMeta;
        // Only consider columns with sticky property when scrollX is true
        if (scrollX && meta?.sticky === 'left') {
          leftStickyIndices.push(index);
        } else if (scrollX && meta?.sticky === 'right') {
          rightStickyIndices.push(index);
        }
      });

      // Calculate left sticky positions based on rendered width
      let leftAccumulatedWidth = 0;
      leftStickyIndices.forEach(index => {
        const headerCell = headerCells[index];
        if (headerCell) {
          leftPositions[index] = leftAccumulatedWidth;
          leftAccumulatedWidth += headerCell.offsetWidth; // Use offsetWidth for actual rendered width
        }
      });

      // Calculate right sticky positions based on rendered width (iterate from right)
      let rightAccumulatedWidth = 0;
      // Sort right indices in descending order to calculate from right edge
      rightStickyIndices
        .sort((a, b) => b - a)
        .forEach(index => {
          const headerCell = headerCells[index];
          if (headerCell) {
            rightPositions[index] = rightAccumulatedWidth;
            rightAccumulatedWidth += headerCell.offsetWidth; // Use offsetWidth
          }
        });

      setStickyPositions({ left: leftPositions, right: rightPositions });

      // Also update initial scroll state based on whether scrolling is possible
      if (containerRef.current) {
        const canScrollHorizontally = containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsScrolledLeft(true); // Always start at left edge
        setIsScrolledRight(!canScrollHorizontally); // If cannot scroll, must be at right edge too
      } else {
        setIsScrolledLeft(true);
        setIsScrolledRight(true);
      }
    };

    // Use ResizeObserver to recalculate on container or table size changes
    const resizeObserver = new ResizeObserver(calculateStickyPositions);

    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }
    if (containerRef.current) {
      // Observe the scrollable container to handle width changes
      resizeObserver.observe(containerRef.current);
    }

    // Initial calculation
    calculateStickyPositions();

    // Cleanup observer
    return () => {
      resizeObserver.disconnect();
    };
  }, [columns, data, scrollX]); // Recalculate if columns, data, or scrollX change

  // Effect to update URL search params when pagination or sorting state changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    // Update page and pageSize params
    newParams.set('page', (paginationState.pageIndex + 1).toString());
    newParams.set('pageSize', paginationState.pageSize.toString());

    // Update sorting params
    if (sortingState.length > 0) {
      const sortQuery = sortingState.map(sort => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`).join(',');
      newParams.set('sort', sortQuery);
    } else {
      newParams.delete('sort');
    }

    // Only update if params have actually changed
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }

    // Call external handlers for server-side mode
    if (!clientSidePagination) {
      if (onPageChange) {
        // Kiểm tra xem giá trị page hoặc sort có thay đổi không
        const pageParam = searchParams.get('page');
        const sortParam = searchParams.get('sort') || '';

        const currentPage = (paginationState.pageIndex + 1).toString();
        const currentSort = sortingState.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',');

        const pageChanged = pageParam !== currentPage;
        const sortChanged = sortParam !== currentSort;

        // Chỉ gọi onPageChange khi page hoặc sort thay đổi (pageSize được xử lý trực tiếp trong handlePageSizeChange)
        if (pageChanged || sortChanged) {
          onPageChange(paginationState.pageIndex + 1, paginationState.pageSize, sortingState);
        }
      } else {
        // Fallback nếu chỉ cung cấp các handlers cụ thể
        const sortParam = searchParams.get('sort') || '';
        const currentSort = sortingState.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',');

        // Kiểm tra sự thay đổi của sort (pageSize được xử lý trong handlePageSizeChange)
        if (sortParam !== currentSort && onSortingChange) {
          onSortingChange(sortingState);
        }
      }
    }
  }, [
    paginationState,
    sortingState,
    clientSidePagination,
    searchParams,
    setSearchParams,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
  ]);

  // Helper to parse sorting state from URL param
  const parseSortingParams = (sortParam: string): SortingState => {
    if (!sortParam) return [];
    return sortParam.split(',').map(item => {
      const [id, direction] = item.split(':');
      return {
        id,
        desc: direction === 'desc',
      };
    });
  };

  // Handle scroll for sticky column shadows (only if scrollX is true)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollX) return; // Only handle scroll if scrollX is enabled

    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const maxScrollLeft = target.scrollWidth - target.clientWidth;

    // Check if horizontal scroll is possible
    const canScrollHorizontally = target.scrollWidth > target.clientWidth;

    // Determine if we're at the left or right edge
    // Add a small tolerance for floating point inaccuracies
    setIsScrolledLeft(scrollLeft <= 1); // At or near the left edge
    setIsScrolledRight(!canScrollHorizontally || Math.abs(scrollLeft - maxScrollLeft) <= 1); // At or near the right edge, or no scroll needed
  };

  // Use React Table hook
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: paginationState,
      sorting: sortingState,
      // Add any other state like columnFilters, globalFilter, etc. here
    },
    onPaginationChange: setPaginationState, // Update internal pagination state
    onSortingChange: setSortingState, // Update internal sorting state
    getCoreRowModel: getCoreRowModel(),
    // Conditionally add pagination and sorting models
    getPaginationRowModel: clientSidePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: clientSidePagination ? getSortedRowModel() : undefined,
    manualPagination: !clientSidePagination, // Manual for server-side
    manualSorting: !clientSidePagination, // Manual for server-side
    pageCount: clientSidePagination ? Math.ceil(data.length / paginationState.pageSize) : pagination?.total_pages || -1, // -1 means react-table doesn't know the count
    // Future: Add getFilteredRowModel, manualFiltering etc.
  });

  // Get pagination info based on mode
  const totalItems = clientSidePagination ? data.length : pagination?.total_items || 0;
  const currentPage = clientSidePagination ? table.getState().pagination.pageIndex + 1 : pagination?.current_page || 1;
  const totalPages = clientSidePagination ? table.getPageCount() : pagination?.total_pages || 1;
  // Calculate from/to based on react-table state for client-side
  const fromItem =
    clientSidePagination && table.getRowModel().rows.length > 0
      ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
      : pagination?.from || 0;
  const toItem =
    clientSidePagination && table.getRowModel().rows.length > 0
      ? fromItem + table.getRowModel().rows.length - 1
      : pagination?.to || 0;

  const effectivePageSize = clientSidePagination ? table.getState().pagination.pageSize : paginationState.pageSize; // Use react-table state for CS, local state for SS

  // Memoize handlers that are passed down
  const handlePageChange = useMemo(
    () => (page: number) => {
      // React-table pageIndex is 0-based
      const newPageIndex = page - 1;
      if (clientSidePagination) {
        table.setPageIndex(newPageIndex);
      } else {
        // Server-side: Update internal state, effect handles the rest
        // Only update if the page is actually different to avoid unnecessary effect runs
        if (paginationState.pageIndex !== newPageIndex) {
          setPaginationState(prevState => ({ ...prevState, pageIndex: newPageIndex }));
        }
      }
    },
    [clientSidePagination, table, paginationState.pageIndex] // Depend on relevant states and table instance
  );

  const handlePageSizeChange = useMemo(
    () => (size: number) => {
      if (clientSidePagination) {
        table.setPageSize(size);
      } else {
        // Server-side: Update internal state, effect handles the rest
        // Reset page to 1 when page size changes
        if (paginationState.pageSize !== size) {
          setPaginationState(prevState => ({ ...prevState, pageSize: size, pageIndex: 0 }));

          // Call external handler for server-side mode
          if (onPageSizeChange) {
            onPageSizeChange(size, sortingState);
          }
        }
      }
    },
    [clientSidePagination, table, paginationState.pageSize, onPageSizeChange, sortingState] // Thêm dependencies
  );

  // Main table content
  const tableContent = (
    <div
      ref={containerRef}
      className={`data-table__container ${scrollX ? 'data-table__scroll-x-enabled' : ''}`} // Add class when scrollX is enabled
      onScroll={handleScroll}
    >
      {loading && (
        <div
          className={`data-table__loading-overlay d-flex justify-content-center align-items-center ${loading ? 'show' : ''}`}
        >
          <div className="spinner-border text-primary data-table__spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <div
        className="data-table__scroll-y"
        style={{ maxHeight: scrollHeight, maxWidth: scrollX ? '1px' : '', minWidth: scrollX ? '100%' : '' }}
      >
        {/* Vertical scroll container */}
        <table ref={tableRef} id={`${id}-table`} className="data-table__table table table-bordered table-hover mb-0">
          {/* Bootstrap table classes */}
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  // Use the column definition's meta directly for sticky/sortable
                  const meta = header.column.columnDef.meta as ExtendedCustomMeta;
                  // Only apply sticky logic if scrollX is true and meta exists
                  const isStickyLeft = scrollX && meta?.sticky === 'left';
                  const isStickyRight = scrollX && meta?.sticky === 'right';
                  const isSortable = meta?.sortable;
                  const columnId = header.column.id; // Get column id for sorting
                  const currentSorting = header.column.getIsSorted(); // 'asc' | 'desc' | false

                  // Calculate the sticky position using the state calculated in useEffect
                  // Use default 0 if stickyPositions[side][index] is undefined (e.g., scrollX is false)
                  const leftPosition = isStickyLeft ? stickyPositions.left[header.column.getIndex()] || 0 : undefined;
                  const rightPosition = isStickyRight
                    ? stickyPositions.right[header.column.getIndex()] || 0
                    : undefined;

                  return (
                    <th
                      key={header.id}
                      className={`
                        text-nowrap align-middle custom-header
                        ${isStickyLeft ? 'sticky-col sticky-left' : ''}
                        ${isStickyRight ? 'sticky-col sticky-right' : ''}
                        ${isSortable ? 'sortable' : ''}
                        // Add shadow class based on scroll position IF scrollX is enabled
                        ${scrollX && isStickyLeft && !isScrolledLeft ? 'show-shadow' : ''}
                        ${scrollX && isStickyRight && !isScrolledRight ? 'show-shadow' : ''}
                      `}
                      // Add data attributes for SCSS z-index stacking IF scrollX is enabled
                      {...(isStickyLeft
                        ? {
                            'data-sticky-left-index': Object.keys(stickyPositions.left).indexOf(
                              header.column.getIndex().toString()
                            ),
                          }
                        : {})}
                      {...(isStickyRight
                        ? {
                            'data-sticky-right-index': Object.keys(stickyPositions.right).indexOf(
                              header.column.getIndex().toString()
                            ),
                          }
                        : {})}
                      style={{
                        width: meta?.width
                          ? typeof meta.width === 'number'
                            ? `${meta.width}px`
                            : meta.width
                          : undefined,
                        minWidth: meta?.width
                          ? typeof meta.width === 'number'
                            ? `${meta.width}px`
                            : meta.width
                          : undefined,
                        maxWidth: meta?.width
                          ? typeof meta.width === 'number'
                            ? `${meta.width}px`
                            : meta.width
                          : undefined,
                        backgroundColor: headerBgColor,
                        // Apply sticky positions only if sticky is enabled by scrollX
                        left: isStickyLeft ? `${leftPosition}px` : undefined,
                        right: isStickyRight ? `${rightPosition}px` : undefined,
                        cursor: isSortable ? 'pointer' : 'default',
                      }}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined} // Add sort handler
                      title={
                        isSortable
                          ? currentSorting === 'asc'
                            ? 'Sort descending'
                            : currentSorting === 'desc'
                              ? 'Clear sort'
                              : 'Sort ascending'
                          : undefined
                      } // Add helpful title
                    >
                      <div className="d-flex align-items-center">
                        {/* Use flex to align header text and icon */}
                        <div className="flex-grow-1 text-truncate">
                          {/* Allow text to truncate */}
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                        {/* Sort icon */}
                        {isSortable && (
                          <span className="data-table__sort-icon ms-1">
                            {/* Add spacing */}
                            {/* Use Font Awesome classes */}
                            <i
                              className={`fas ${currentSorting === 'asc' ? 'fa-sort-up' : currentSorting === 'desc' ? 'fa-sort-down' : 'fa-sort text-muted'}`}
                            ></i>
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center data-table__no-data">
                  {/* Use Bootstrap text-center */}
                  テーブルにデータがありません {/* No data available in table */}
                </td>
              </tr>
            ) : (
              // Use getRowModel().rows for client-side or server-side data based on manualPagination config
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    const meta = cell.column.columnDef.meta as ExtendedCustomMeta;
                    // Only apply sticky logic if scrollX is true and meta exists
                    const isStickyLeft = scrollX && meta?.sticky === 'left';
                    const isStickyRight = scrollX && meta?.sticky === 'right';

                    // Calculate the sticky position using the state calculated in useEffect
                    const leftPosition = isStickyLeft ? stickyPositions.left[cell.column.getIndex()] || 0 : undefined;
                    const rightPosition = isStickyRight
                      ? stickyPositions.right[cell.column.getIndex()] || 0
                      : undefined;

                    return (
                      <td
                        key={cell.id}
                        className={`
                          ${isStickyLeft ? 'sticky-col sticky-left' : ''}
                          ${isStickyRight ? 'sticky-col sticky-right' : ''}
                           // Add shadow class based on scroll position IF scrollX is enabled
                          ${scrollX && isStickyLeft && !isScrolledLeft ? 'show-shadow' : ''}
                          ${scrollX && isStickyRight && !isScrolledRight ? 'show-shadow' : ''}
                        `}
                        // Add data attributes for SCSS z-index stacking IF scrollX is enabled
                        {...(isStickyLeft
                          ? {
                              'data-sticky-left-index': Object.keys(stickyPositions.left).indexOf(
                                cell.column.getIndex().toString()
                              ),
                            }
                          : {})}
                        {...(isStickyRight
                          ? {
                              'data-sticky-right-index': Object.keys(stickyPositions.right).indexOf(
                                cell.column.getIndex().toString()
                              ),
                            }
                          : {})}
                        style={{
                          width: meta?.width
                            ? typeof meta.width === 'number'
                              ? `${meta.width}px`
                              : meta.width
                            : undefined,
                          minWidth: meta?.width
                            ? typeof meta.width === 'number'
                              ? `${meta.width}px`
                              : meta.width
                            : undefined,
                          maxWidth: meta?.width
                            ? typeof meta.width === 'number'
                              ? `${meta.width}px`
                              : meta.width
                            : undefined,
                          // Apply sticky positions only if sticky is enabled by scrollX
                          left: isStickyLeft ? `${leftPosition}px` : undefined,
                          right: isStickyRight ? `${rightPosition}px` : undefined,
                          // Inherit background from thead sticky cells for consistency if needed, or keep white
                          backgroundColor: isStickyLeft || isStickyRight ? '#fff' : undefined, // Keep sticky cells white by default
                          // Ensure text overflow ellipsis is applied
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Debug info - remove in production
  const debugInfo = import.meta.env.VITE_NODE_ENV === 'development' && (
    <div className="text-muted small mb-2">
      ScrollX Enabled: {scrollX ? 'Yes' : 'No'} | Container ScrollLeft:
      {containerRef.current?.scrollLeft?.toFixed(0) || 0} | Container ScrollWidth:
      {containerRef.current?.scrollWidth?.toFixed(0) || 0} | Container ClientWidth:
      {containerRef.current?.clientWidth?.toFixed(0) || 0} | Scrolled Left Edge: {isScrolledLeft ? 'Yes' : 'No'} |
      Scrolled Right Edge: {isScrolledRight ? 'Yes' : 'No'} | Sticky Positions Left:
      {JSON.stringify(stickyPositions.left)} | Sticky Positions Right: {JSON.stringify(stickyPositions.right)} | Current
      PageSize State: {paginationState.pageSize} | Current PageIndex State: {paginationState.pageIndex} | Current
      Sorting State: {JSON.stringify(sortingState)} | Mode: {clientSidePagination ? 'Client' : 'Server'}
    </div>
  );

  return (
    <div className="data-table position-relative">
      {/* Use the base class */}
      {debugInfo}
      {/* Loading Overlay */}
      {tableContent}
      {/* Pagination and Info Footer */}
      {(pagination || clientSidePagination) && ( // Show footer if pagination prop exists (server) or clientSide is true
        <div className="data-table__footer mt-3 d-flex justify-content-between flex-wrap align-items-center">
          {/* Bootstrap classes */}
          <div className="data-table__info d-flex align-items-center gap-3">
            {/* Bootstrap classes */}
            {/* Page Size Selector */}
            <PageSizeSelector
              id={id}
              currentPageSize={effectivePageSize} // Use effective page size
              handlePageSizeChange={handlePageSizeChange}
              pageSizeOptions={pageSizeOptions}
              disabled={loading}
            />
            {/* Table Info (Showing X to Y of Z entries) */}
            <TableInfo id={id} totalItems={totalItems} from={fromItem} to={toItem} disabled={loading} />
          </div>
          {/* Pagination Navigation */}
          <PaginationNav
            id={id}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
