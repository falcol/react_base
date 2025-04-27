// src/hooks/useEmailOptions.ts
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface User {
  email: string;
}

interface ApiResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

interface UseEmailOptionsReturn {
  emailOptions: string[];
  emailLoading: boolean;
  emailHasMore: boolean;
  fetchMoreEmails: (searchText?: string) => Promise<void>; // Function to load next page or search
}

const useEmailOptions = (): UseEmailOptionsReturn => {
  const [emailOptions, setEmailOptions] = useState<string[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailPage, setEmailPage] = useState(0);
  const [emailHasMore, setEmailHasMore] = useState(true);
  const [currentSearchText, setCurrentSearchText] = useState(""); // State to hold current search text

  const fetchEmailData = useCallback(
    async (page: number, search: string = "") => {
      if (emailLoading) return; // Prevent multiple fetches

      setEmailLoading(true);
      try {
        const limit = 10; // Fetch more options at once
        const res = await axios.get<ApiResponse>(
          "https://dummyjson.com/users",
          {
            params: {
              limit,
              skip: page * limit,
            },
          },
        );

        let users = res.data.users;

        // If search text is present, filter client-side
        if (search) {
          // Filter the *newly fetched* users by the current search text
          users = users.filter((user) =>
            user.email.toLowerCase().includes(search.toLowerCase()),
          );
        }

        const newEmails = users.map((user) => user.email);

        setEmailOptions((prev) =>
          page === 0 ? newEmails : [...prev, ...newEmails],
        ); // Replace if page 0 (new search), append otherwise
        setEmailHasMore(res.data.users.length === limit); // Check if the API returned a full page (regardless of client-side filter)
        setEmailPage(page);
      } catch (error) {
        console.error("Failed to fetch emails:", error);
        setEmailOptions([]);
        setEmailHasMore(false); // Assume no more on error
      } finally {
        setEmailLoading(false);
      }
    },
    [emailLoading],
  ); // Depend on emailLoading to prevent re-entry

  // Initial fetch
  useEffect(() => {
    fetchEmailData(0, currentSearchText);
  }, [fetchEmailData, currentSearchText]); // Re-fetch when the search text changes

  // Public function to trigger fetching more (for infinite scroll)
  const fetchMoreEmails = useCallback(() => {
    if (emailHasMore && !emailLoading) {
      fetchEmailData(emailPage + 1, currentSearchText);
    }
  }, [
    emailHasMore,
    emailLoading,
    emailPage,
    currentSearchText,
    fetchEmailData,
  ]);

  // Public function to trigger a new search
  const searchEmails = useCallback((searchText: string) => {
    setCurrentSearchText(searchText); // Update search text state
    setEmailOptions([]); // Clear existing options immediately
    setEmailPage(0); // Reset page to 0 for new search
    setEmailHasMore(true); // Assume there are results for a new search
    // fetchEmailData will be called by the useEffect when currentSearchText changes
  }, []);

  return {
    emailOptions,
    emailLoading,
    emailHasMore,
    fetchMoreEmails,
    searchEmails,
  };
};

export default useEmailOptions;
