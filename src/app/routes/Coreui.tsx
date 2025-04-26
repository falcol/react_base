import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CPagination,
  CPaginationItem,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";

// Remove Ant Design imports
// import CustomButton from "@/components/CustomButton";
// import { Spin } from "antd";
// import { Input, Pagination, Select, Space, Table } from "antd";
// Remove Ant Design type import
// import type { TablePaginationConfig } from "antd/es/table";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Import the CSS Module
import styles from "./Home.module.css";

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

// --- Create Custom Pagination State Type ---
// Replace Ant Design's TablePaginationConfig
interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
  // Add other pagination-related properties if needed later
}
// --- End Custom Pagination State Type ---

export default function Home() {
  const [data, setData] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  // --- Use Custom Pagination State Type ---
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // --- End Use Custom Pagination State Type ---

  const [searchField, setSearchField] = useState("firstName");
  const [searchValue, setSearchValue] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- CoreUI Table Columns Definition ---
  const columns = useMemo(
    () => [
      { key: "image", label: "Avatar", _style: { width: "80px" } },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "email", label: "Email" },
    ],
    [],
  );
  // --- End CoreUI Table Columns Definition ---

  // Fetch main table data based on pagination and filters
  const fetchData = async (page = 1, pageSize = 10, field = "", value = "") => {
    setLoading(true);
    try {
      // Same simulation for dummyjson API limitations
      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit: 100, // Fetch a batch to filter locally
          skip: 0, // Start from beginning for filtering
        },
      });

      let users = res.data.users;

      // Apply filters locally based on searchField and searchValue
      if (field && value) {
        users = users.filter((user) => {
          const itemValue = String((user as any)[field]).toLowerCase();
          const searchTerm = value.toLowerCase();
          return itemValue.includes(searchTerm);
        });
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
        total: users.length, // Use filtered count for local pagination accuracy
      }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Load from URL on component mount and URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const field = searchParams.get("searchField") || "firstName";
    const value = searchParams.get("searchValue") || "";

    setSearchField(field);
    setSearchValue(value);

    // Set pagination state based on URL before fetching
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
      // Total will be updated by fetchData
    }));

    // Fetch data based on URL params
    fetchData(page, pageSize, field, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL and fetch data when pagination changes (from the Pagination component or pageSize select)
  const handlePaginationChange = (current: number, pageSize: number) => {
    updateURL(current, pageSize, searchField, searchValue);
  };

  const updateURL = (
    page: number,
    pageSize: number,
    field: string,
    value: string,
  ) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (value) {
      params.set("searchField", field);
      params.set("searchValue", value);
    } else {
      params.delete("searchField");
      params.delete("searchValue");
    }

    if (searchParams.toString() !== params.toString()) {
      navigate(`?${params.toString()}`, { replace: true });
    }
  };

  const handleSearch = () => {
    // Reset to page 1 on new search
    updateURL(1, pagination.pageSize || 10, searchField, searchValue);
  };

  const handleReset = () => {
    setSearchValue("");
    setSearchField("firstName");
    updateURL(1, pagination.pageSize || 10, "firstName", "");
  };

  // Calculate total pages for pagination component
  const totalPages = Math.ceil(
    (pagination.total || 0) / (pagination.pageSize || 10),
  );

  return (
    // Use CContainer fluid for full width, add some padding
    // Add class names where appropriate in your JSX

    <CContainer fluid className={`${styles.container} p-3`}>
      <CRow className={`${styles.row} mb-3 align-items-center g-2`}>
        <CCol xs="auto">
          <CFormSelect
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            aria-label="Select search field"
            className={styles["search-field"]}
          >
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="email">Email</option>
          </CFormSelect>
        </CCol>
        <CCol xs="auto">
          <CFormInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Enter ${searchField} value...`}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className={styles["search-field"]}
          />
        </CCol>
        <CCol xs="auto">
          <CButton
            color="primary"
            onClick={handleSearch}
            className={styles["button"] + " " + styles["primary"]}
          >
            Search
          </CButton>
        </CCol>
        <CCol xs="auto">
          <CButton
            color="secondary"
            onClick={handleReset}
            className={styles["button"] + " " + styles["secondary"]}
          >
            Reset
          </CButton>
        </CCol>
      </CRow>

      {/* Table */}
      <div className={styles["table-container"]}>
        {loading ? (
          <div className={styles["loading-overlay"]}>
            <CSpinner size="sm" aria-hidden="true" /> Loading...
          </div>
        ) : (
          <CTable bordered striped hover responsive className={styles["table"]}>
            <CTableHead>
              <CTableRow>
                {columns.map((column) => (
                  <CTableHeaderCell
                    key={column.key}
                    scope="col"
                    style={column._style}
                  >
                    {column.label}
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <CTableRow key={item.id}>
                    {columns.map((column) => (
                      <CTableDataCell key={column.key}>
                        {column.key === "image" ? (
                          <img
                            src={item.image}
                            alt="avatar"
                            width={40}
                            height={40}
                            style={{ borderRadius: "50%" }}
                          />
                        ) : (
                          (item as any)[column.key]
                        )}
                      </CTableDataCell>
                    ))}
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell
                    colSpan={columns.length}
                    className={styles["table-empty-message"]}
                  >
                    No Data
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </div>

      {/* Pagination */}
      <div className={styles["pagination-container"]}>
        <div className="d-flex align-items-center gap-2">
          <CFormSelect
            value={pagination.pageSize}
            onChange={(e) => handlePaginationChange(1, Number(e.target.value))}
            aria-label="Select items per page"
            className={styles["pagination-select"]}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </CFormSelect>
          <span className={styles["pagination-text"]}>
            {data.length > 0
              ? `${(pagination.current! - 1) * pagination.pageSize! + 1}-${
                  (pagination.current! - 1) * pagination.pageSize! + data.length
                } of ${pagination.total} items`
              : pagination.total > 0
                ? `0 of ${pagination.total} items`
                : ""}
          </span>
        </div>

        <div>
          <CPagination aria-label="Page navigation">
            {[...Array(totalPages).keys()].map((pageIndex) => (
              <CPaginationItem
                key={pageIndex + 1}
                active={pagination.current === pageIndex + 1}
                disabled={pagination.current === pageIndex + 1}
                onClick={() =>
                  handlePaginationChange(
                    pageIndex + 1,
                    pagination.pageSize || 10,
                  )
                }
              >
                {pageIndex + 1}
              </CPaginationItem>
            ))}
          </CPagination>
        </div>
      </div>
    </CContainer>
  );
}
