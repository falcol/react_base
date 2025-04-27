// src/hooks/useUserData.ts
import type { TablePaginationConfig } from "antd/es/table";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

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

interface UseUserDataProps {
  page: number;
  pageSize: number;
  searchField: string;
  searchValue: string;
  selectedEmail: string | null;
}

interface UseUserDataReturn {
  data: User[];
  loading: boolean;
  pagination: TablePaginationConfig;
  // fetchData: (params: UseUserDataProps) => Promise<void>; // Optional: if you need to imperative trigger
}

const useUserData = ({
  page,
  pageSize,
  searchField,
  searchValue,
  selectedEmail,
}: UseUserDataProps): UseUserDataReturn => {
  const [data, setData] = useState<User[]>([] as User[]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // DummyJSON doesn't support direct search on arbitrary fields with pagination
      // We'll fetch a larger set and filter client-side IF a search value is present and no email is selected.
      // If only email is selected, we fetch a smaller set and filter.
      // If no search/email, we use standard pagination.

      const limit = selectedEmail ? 100 : pageSize; // Fetch enough to potentially find the email or apply text search
      const skip = selectedEmail ? 0 : (page - 1) * pageSize; // Only apply skip if not filtering by email

      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit,
          skip,
        },
      });

      let users = res.data.users;
      let totalUsers = res.data.total;

      // Client-side filtering based on selectedEmail or searchValue
      if (selectedEmail) {
        users = users.filter((user) => user.email === selectedEmail);
        totalUsers = users.length; // Total is just the matched email (assuming emails are unique)
      } else if (searchValue) {
        users = users.filter((user) =>
          String((user as any)[searchField]) // Use `as any` for dynamic field access
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
        );
        totalUsers = users.length; // Total is the count after filtering
      }

      // If filtering client-side, apply pagination AFTER filtering
      const paginatedUsers =
        selectedEmail || searchValue
          ? users.slice((page - 1) * pageSize, page * pageSize)
          : users; // If no filter, users are already paginated by API

      setData(paginatedUsers);
      setTotal(totalUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchField, searchValue, selectedEmail]); // Dependencies for useCallback

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Trigger fetch when fetchData changes (due to prop changes)

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize: pageSize,
    total: total,
  };

  return {
    data,
    loading,
    pagination,
    // fetchData // Return if needed externally
  };
};

export default useUserData;
