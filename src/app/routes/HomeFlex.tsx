// src/pages/Home.tsx
import { Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Import the refactored components and hooks
import UserSearchForm from "@/components/UserSearchForm";
import UserTableDisplay from "@/components/UserTableDisplay";
import useEmailOptions from "@/hooks/useEmailOptions";
import useUserData from "@/hooks/useUserData";

// Define User type if not already globally available or imported elsewhere
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State managed by Home, derived from URL or user interaction
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentSearchField, setCurrentSearchField] = useState("firstName");
  const [currentSearchValue, setCurrentSearchValue] = useState("");
  const [currentSelectedEmail, setCurrentSelectedEmail] = useState<
    string | null
  >(null);

  // Use the custom hooks
  const { data, loading, pagination } = useUserData({
    page: currentPage,
    pageSize: currentPageSize,
    searchField: currentSearchField,
    searchValue: currentSearchValue,
    selectedEmail: currentSelectedEmail,
  });

  const {
    emailOptions,
    emailLoading,
    emailHasMore,
    fetchMoreEmails,
    searchEmails,
  } = useEmailOptions();

  // Effect to synchronize state from URL on initial load and URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const field = searchParams.get("searchField") || "firstName";
    const value = searchParams.get("searchValue") || "";
    const email = searchParams.get("email");

    // Update component state based on URL params
    setCurrentPage(page);
    setCurrentPageSize(pageSize);
    setCurrentSearchField(field);
    setCurrentSearchValue(value);
    setCurrentSelectedEmail(email || null);

    // Note: useUserData hook's useEffect listens to changes in these states
    // and triggers data fetching automatically.
  }, [searchParams]); // Rerun effect when searchParams object changes

  // Function to update URL and component state
  const updateURLAndState = useCallback(
    (
      page: number,
      pageSize: number,
      field: string,
      value: string,
      email: string | null,
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      // Prioritize email search over field/value search in URL
      if (email) {
        params.set("email", email);
        // When selecting email, clear text search state
        field = "firstName"; // Reset field state
        value = ""; // Reset value state
      } else {
        // Only add field/value if value is not empty
        if (value) {
          params.set("searchField", field);
          params.set("searchValue", value);
        }
      }

      // Update state first
      setCurrentPage(page);
      setCurrentPageSize(pageSize);
      setCurrentSearchField(field);
      setCurrentSearchValue(value);
      setCurrentSelectedEmail(email); // This will be null if clearing email

      // Then update URL
      navigate(`?${params.toString()}`, { replace: true });
    },
    [navigate],
  );

  // Handlers passed to UserSearchForm
  const handleSearch = useCallback(
    (field: string, value: string, email: string | null) => {
      // When searching from the form, reset to page 1
      updateURLAndState(1, currentPageSize, field, value, email);
    },
    [currentPageSize, updateURLAndState],
  );

  const handleReset = useCallback(() => {
    // Reset all search criteria and go to page 1
    updateURLAndState(1, currentPageSize, "firstName", "", null);
  }, [currentPageSize, updateURLAndState]);

  // Handlers passed to UserTableDisplay
  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      // When pagination changes, update URL and state
      // Keep current search field/value/email when changing page/size
      updateURLAndState(
        page,
        pageSize,
        currentSearchField,
        currentSearchValue,
        currentSelectedEmail,
      );
    },
    [
      currentSearchField,
      currentSearchValue,
      currentSelectedEmail,
      updateURLAndState,
    ],
  );

  // Handlers for Email Select (pass through to useEmailOptions hook functions)
  const handleEmailSearch = useCallback(
    (value: string) => {
      searchEmails(value);
    },
    [searchEmails],
  );

  const handleEmailScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const target = e.target as HTMLDivElement; // Cast target to HTMLDivElement
      // Check if scroll is at the bottom
      const isAtBottom =
        target.scrollHeight - target.scrollTop === target.clientHeight;
      if (isAtBottom) {
        fetchMoreEmails();
      }
    },
    [fetchMoreEmails],
  );

  const handleEmailSelect = useCallback((value: string | null) => {
    // This handler is primarily for updating the Home component's state
    // The form component also calls this to keep its internal state in sync,
    // but the actual fetch is triggered by the handleSearch/handleReset calls
    // which use the *updated* currentSelectedEmail state.
    // We *could* trigger a fetch directly here, but tying search results to the
    // "Search" button click is more explicit and matches the form's intent.
    setCurrentSelectedEmail(value);
    // When an email is selected, clear the text search fields in state
    if (value !== null) {
      setCurrentSearchField("firstName");
      setCurrentSearchValue("");
    }
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <UserSearchForm
        initialSearchField={currentSearchField}
        initialSearchValue={currentSearchValue}
        initialSelectedEmail={currentSelectedEmail}
        emailOptions={emailOptions}
        emailLoading={emailLoading}
        emailHasMore={emailHasMore}
        onSearch={handleSearch}
        onReset={handleReset}
        onEmailSearch={handleEmailSearch}
        onEmailScroll={handleEmailScroll}
        onEmailSelect={handleEmailSelect}
      />

      <UserTableDisplay
        data={data}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
    </Space>
  );
}
