import CustomButton from "@/components/CustomButton";
import { Spin } from "antd";

import { Input, Pagination, Select, Space } from "antd"; // Removed Table import
import type { TablePaginationConfig } from "antd/es/table"; // Keep this type
import axios from "axios";
import { useEffect, useMemo, useState } from "react"; // Import useMemo
import { useNavigate, useSearchParams } from "react-router-dom";

// Import necessary hooks from TanStack Table
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

interface ApiResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

const { Option } = Select;

// Helper to create columns for TanStack Table
const columnHelper = createColumnHelper<User>();

export default function Home() {
  const [data, setData] = useState<User[]>([]);
  const [emailOptions, setEmailOptions] = useState<string[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailPage, setEmailPage] = useState(0);
  const [emailHasMore, setEmailHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchField, setSearchField] = useState("firstName");
  const [searchValue, setSearchValue] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- TanStack Table Columns Definition ---
  // Use useMemo to prevent re-creating columns on every render
  const columns = useMemo(
    () => [
      columnHelper.accessor("image", {
        header: "Avatar",
        cell: (info) => (
          <img
            src={info.getValue()} // Get the cell value (image URL)
            alt="avatar"
            width={40}
            height={40}
            style={{ borderRadius: "50%" }}
          />
        ),
        enableSorting: false, // Disable sorting for this column
      }),
      columnHelper.accessor("firstName", {
        header: "First Name",
        cell: (info) => info.getValue(),
        // You could add sorting/filtering hooks here if they were client-side
      }),
      columnHelper.accessor("lastName", {
        header: "Last Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
    ],
    [], // Columns don't depend on any state in this case
  );
  // --- End TanStack Table Columns Definition ---

  // Fetch email options
  const fetchEmailOptions = async (page: number, search: string = "") => {
    setEmailLoading(true);
    try {
      const limit = 5; // fetch 5 emails at a time
      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit,
          skip: page * limit,
        },
      });

      let users = res.data.users;

      // If there's search text, filter locally (as the dummy API doesn't support email search directly on fetch)
      if (search) {
        users = users.filter((user) =>
          user.email.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const newEmails = users.map((user) => user.email);
      // Use a Set to avoid duplicates if the same users are fetched on different pages
      setEmailOptions((prev) => Array.from(new Set([...prev, ...newEmails])));
      // Determine if more emails are available from the API perspective *before* local filtering
      setEmailHasMore(res.data.users.length === limit);
      setEmailPage(page);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setEmailLoading(false);
    }
  };

  // Fetch main table data based on pagination and filters
  const fetchData = async (
    page = 1,
    pageSize = 10,
    field = "",
    value = "",
    email: string | null = null,
  ) => {
    setLoading(true);
    try {
      // Dummyjson doesn't support complex search/filter on the endpoint directly
      // We fetch a potentially larger set or rely on the API's limit/skip
      // For this example, we'll fetch the requested page and apply filters locally
      // A real API would handle filtering/searching server-side with params
      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit: 100, // Fetch a reasonable number to filter locally
          skip: 0, // Start from beginning to apply filters globally (simulated)
        },
      });

      let users = res.data.users;
      const totalUsers = res.data.total; // Keep the actual total

      // Apply filters locally
      if (email) {
        users = users.filter((user) => user.email === email);
      } else if (field && value) {
        users = users.filter((user) =>
          String((user as any)[field])
            .toLowerCase()
            .includes(value.toLowerCase()),
        );
      }

      // Apply pagination locally after filtering
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedUsers = users.slice(start, end);

      setData(paginatedUsers);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        // Set total based on the *filtered* data length if filtering is local
        // Or use the API's total if filters are server-side and the total reflects the filter
        // Given dummyjson limitations and local filtering, using the filtered users count is more accurate for the *current view's* context
        // If we wanted the total matching items for the *entire* search, we'd need a different API pattern.
        // Let's use the filtered users count for now, as dummyjson doesn't provide a filtered total.
        total: users.length, // Use filtered count for local pagination accuracy
        // total: res.data.total, // Use API total if filters are server-side
      }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setData([]); // Clear data on error
      setPagination((prev) => ({ ...prev, total: 0 })); // Reset total on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailOptions(0);
  }, []);

  // Load from URL on component mount and URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const field = searchParams.get("searchField") || "firstName";
    const value = searchParams.get("searchValue") || "";
    const email = searchParams.get("email");

    setSearchField(field);
    setSearchValue(value);
    setSelectedEmail(email || null);

    // Set pagination state based on URL before fetching
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
      // Total will be updated by fetchData
    }));

    // Fetch data based on URL params
    fetchData(page, pageSize, field, value, email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Re-run effect when URL search params change

  // Update URL and fetch data when pagination changes (from the Pagination component or pageSize select)
  const handlePaginationChange = (current: number, pageSize: number) => {
    updateURL(current, pageSize, searchField, searchValue, selectedEmail);
  };

  const updateURL = (
    page: number,
    pageSize: number,
    field: string,
    value: string,
    email: string | null,
  ) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (email) {
      params.set("email", email);
      // Clear general search if email is selected in URL
      params.delete("searchField");
      params.delete("searchValue");
    } else {
      if (value) {
        params.set("searchField", field);
        params.set("searchValue", value);
      }
      // Clear email if general search is used in URL
      params.delete("email");
    }
    // Navigate only if the URL actually changes
    if (searchParams.toString() !== params.toString()) {
      navigate(`?${params.toString()}`, { replace: true });
    }
    // No need to call fetchData here, the useEffect listening to searchParams will do it
  };

  const handleSearch = () => {
    // Reset to page 1 on new search
    updateURL(
      1,
      pagination.pageSize || 10,
      searchField,
      searchValue,
      selectedEmail,
    );
  };

  const handleReset = () => {
    setSearchValue("");
    setSelectedEmail(null);
    // Reset to page 1 and default params
    updateURL(1, pagination.pageSize || 10, "firstName", "", null);
  };

  const handleEmailSearch = (value: string) => {
    // When typing in the select, reset email list and fetch filtered emails
    setEmailOptions([]);
    setEmailPage(0);
    setEmailHasMore(true); // Assume there might be more until fetch proves otherwise
    fetchEmailOptions(0, value);
  };

  const handleEmailScroll = (e: any) => {
    const target = e.target;
    // Check if scrolled to the bottom
    if (
      target.scrollTop + target.offsetHeight >=
      target.scrollHeight - 20 // Add a small buffer
    ) {
      if (emailHasMore && !emailLoading) {
        // Fetch the next page of emails *without* search text
        // This mimics lazy loading the full list. If the user searched, scrolling won't add more unless they clear the search input.
        // A more complex implementation might lazy load filtered results if the API supported it.
        // For this example, scrolling only loads the next *batch* of the full list.
        const currentSearchValueInSelect =
          (e.target as HTMLElement).querySelector("input")?.value || "";
        if (!currentSearchValueInSelect) {
          // Only load next page if no search text is active in the select
          fetchEmailOptions(emailPage + 1);
        }
      }
    }
  };

  // --- TanStack Table Hook ---
  const table = useReactTable({
    data: data, // Pass the fetched data
    columns: columns, // Pass the column definitions
    getCoreRowModel: getCoreRowModel(), // Basic row model
    manualPagination: true, // Tell TanStack we handle pagination ourselves
    manualSorting: true, // Tell TanStack we handle sorting ourselves (not implemented here)
    manualFiltering: true, // Tell TanStack we handle filtering ourselves

    // Provide current state from our external pagination state (0-based pageIndex)
    state: {
      pagination: {
        pageIndex: pagination?.current ? pagination.current - 1 : 0,
        pageSize: pagination.pageSize || 10,
      },
      // Add other states like sorting, filtering here if implemented manually
    },

    // TanStack can calculate pageCount if total is known.
    // Since we're manual, we provide it based on our external state.
    pageCount: Math.ceil((pagination.total || 0) / (pagination.pageSize || 10)),

    // We don't need onPaginationChange if using Ant Design's Pagination component
    // onPaginationChange: (updater) => {},
  });
  // --- End TanStack Table Hook ---

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%", height: "300px" }}
    >
      {/* Form Search */}
      <div style={{ display: "flex", gap: 8 }}>
        {/* Email select */}
        <Select
          showSearch
          allowClear
          placeholder="Select email..."
          value={selectedEmail || undefined}
          onChange={(value) => {
            setSelectedEmail(value || null);
            // If email is selected, clear general search state
            if (value) {
              setSearchField("firstName"); // Reset search field to default
              setSearchValue("");
            }
          }}
          onSearch={handleEmailSearch}
          onPopupScroll={handleEmailScroll}
          loading={emailLoading}
          style={{ width: 250 }}
          filterOption={false} // Disable local filtering built into Ant Design Select
        >
          {emailOptions.map((email) => (
            <Option key={email} value={email}>
              {email}
            </Option>
          ))}

          {emailLoading && (
            <Option key="loading" disabled value="">
              <div style={{ textAlign: "center" }}>
                <Spin size="small" />
              </div>
            </Option>
          )}
        </Select>

        {/* If email is NOT selected, show general search fields */}
        {!selectedEmail && (
          <>
            <Select
              value={searchField}
              onChange={(value) => setSearchField(value)}
              style={{ width: 150 }}
            >
              <Option value="firstName">First Name</Option>
              <Option value="lastName">Last Name</Option>
              <Option value="email">Email</Option>
            </Select>
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter search value..."
              style={{ width: 200 }}
              // Allow pressing Enter to search
              onPressEnter={handleSearch}
            />
          </>
        )}

        <CustomButton btnType="primary" onClick={handleSearch}>
          Search
        </CustomButton>
        <CustomButton btnType="secondary" onClick={handleReset}>
          Reset
        </CustomButton>
      </div>

      {/* --- TanStack Table Rendering --- */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ overflowX: "auto", height: "300px", minHeight: 300 }}>
          {" "}
          {/* Wrapper for horizontal scroll */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "10px",
                        textAlign: "left",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "10px",
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                // Empty data state
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ textAlign: "center", padding: "50px" }}
                  >
                    No Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* --- End TanStack Table Rendering --- */}

      {/* Pagination - Still using Ant Design */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select
            value={pagination.pageSize}
            onChange={
              (value) => handlePaginationChange(1, value) // Go back to page 1 when page size changes
            }
            style={{ width: 120 }}
          >
            {[10, 20, 50, 100].map((size) => (
              <Select.Option key={size} value={size}>
                {size} / page
              </Select.Option>
            ))}
          </Select>
          <span>
            {/* Displaying items range based on the currently displayed data */}
            {data.length > 0
              ? `${(pagination.current! - 1) * pagination.pageSize! + 1}-${
                  (pagination.current! - 1) * pagination.pageSize! + data.length
                } of ${pagination.total} items`
              : pagination.total > 0
                ? `0 of ${pagination.total} items`
                : ""}{" "}
            {/* Handle case with 0 displayed but total > 0 */}
          </span>
        </div>

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger={false} // We use a separate select for page size
          onChange={(
            page,
            pageSize, // Ant Design Pagination onChange provides both page and pageSize
          ) => handlePaginationChange(page, pageSize)}
        />
      </div>
    </Space>
  );
}
