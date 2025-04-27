// src/components/UserSearchForm.tsx
import CustomButton from "@/components/CustomButton"; // Assuming CustomButton path is correct
import { Input, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";

const { Option } = Select;

interface UserSearchFormProps {
  initialSearchField: string;
  initialSearchValue: string;
  initialSelectedEmail: string | null;
  emailOptions: string[];
  emailLoading: boolean;
  emailHasMore: boolean;
  onSearch: (
    searchField: string,
    searchValue: string,
    selectedEmail: string | null,
  ) => void;
  onReset: () => void;
  onEmailSearch: (value: string) => void;
  onEmailScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  onEmailSelect: (value: string | null) => void;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  initialSearchField,
  initialSearchValue,
  initialSelectedEmail,
  emailOptions,
  emailLoading,
  emailHasMore,
  onSearch,
  onReset,
  onEmailSearch,
  onEmailScroll,
  onEmailSelect,
}) => {
  // Manage internal state for form inputs before search is clicked
  const [searchField, setSearchField] = useState(initialSearchField);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(
    initialSelectedEmail,
  );

  // Sync internal state with initial props (when URL changes)
  useEffect(() => {
    setSearchField(initialSearchField);
  }, [initialSearchField]);

  useEffect(() => {
    setSearchValue(initialSearchValue);
  }, [initialSearchValue]);

  useEffect(() => {
    setSelectedEmail(initialSelectedEmail);
  }, [initialSelectedEmail]);

  const handleLocalSearch = () => {
    // Call the parent's onSearch handler with current internal state
    onSearch(searchField, searchValue, selectedEmail);
  };

  const handleLocalReset = () => {
    // Reset internal state
    setSearchField("firstName"); // Default field
    setSearchValue("");
    setSelectedEmail(null);
    // Call parent's onReset handler
    onReset();
  };

  const handleLocalEmailSelect = (value: string | null) => {
    setSelectedEmail(value);
    // Also clear text search inputs if an email is selected
    if (value !== null) {
      setSearchField("firstName");
      setSearchValue("");
    }
    onEmailSelect(value); // Notify parent
  };

  const handleLocalSearchFieldChange = (value: string) => {
    setSearchField(value);
    // Clear search value if field changes? Optional design choice.
    // setSearchValue("");
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {" "}
      {/* Added flexWrap */}
      {/* Email select */}
      <Select
        showSearch
        allowClear
        placeholder="Select email..."
        value={selectedEmail || undefined} // Antd Select likes undefined for clear state
        onChange={handleLocalEmailSelect}
        onSearch={onEmailSearch} // This is Antd's onSearch for input change
        onPopupScroll={onEmailScroll}
        loading={emailLoading}
        style={{ width: 250 }}
        filterOption={false} // We handle filtering in the hook via onSearch/onPopupScroll
      >
        {emailOptions.map((email) => (
          <Option key={email} value={email}>
            {email}
          </Option>
        ))}

        {/* Show loading indicator in dropdown */}
        {emailLoading &&
          emailOptions.length > 0 && ( // Only show if loading and options exist
            <Option key="loading-more" disabled value="loading-more">
              <div style={{ textAlign: "center" }}>
                <Spin size="small" />
              </div>
            </Option>
          )}
        {emailLoading &&
          emailOptions.length === 0 &&
          !selectedEmail && ( // Show full screen loader if no options yet
            <Option key="loading-initial" disabled value="loading-initial">
              <div style={{ textAlign: "center" }}>
                <Spin size="small" /> Loading Emails...
              </div>
            </Option>
          )}
        {!emailLoading && !emailHasMore && emailOptions.length > 0 && (
          <Option key="no-more" disabled value="no-more">
            No more emails
          </Option>
        )}
      </Select>
      {/* Show field search ONLY if no email is selected */}
      {!selectedEmail && (
        <>
          <Select
            value={searchField}
            onChange={handleLocalSearchFieldChange}
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
          />
        </>
      )}
      <CustomButton btnType="primary" onClick={handleLocalSearch}>
        Search
      </CustomButton>
      <CustomButton btnType="secondary" onClick={handleLocalReset}>
        Reset
      </CustomButton>
    </div>
  );
};

export default UserSearchForm;
