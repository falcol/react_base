// src/components/UserTableDisplay.tsx
import { Pagination, Select, Space, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import React from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

interface UserTableDisplayProps {
  data: User[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onPaginationChange: (page: number, pageSize: number) => void;
}

// Define columns here or pass them as a prop if they vary
const columns: ColumnsType<User> = [
  {
    title: "Avatar",
    dataIndex: "image",
    key: "image",
    render: (image: string) => (
      <img
        src={image}
        alt="avatar"
        width={40}
        height={40}
        style={{ borderRadius: "50%" }}
      />
    ),
    width: 60, // Give it a fixed width
  },
  {
    title: "First Name",
    dataIndex: "firstName",
    key: "firstName",
    sorter: (a, b) => a.firstName.localeCompare(b.firstName), // Example sorter (client-side)
    width: 150,
  },
  {
    title: "Last Name",
    dataIndex: "lastName",
    key: "lastName",
    sorter: (a, b) => a.lastName.localeCompare(b.lastName), // Example sorter
    width: 150,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    sorter: (a, b) => a.email.localeCompare(b.email), // Example sorter
    width: 250,
  },
];

const UserTableDisplay: React.FC<UserTableDisplayProps> = ({
  data,
  loading,
  pagination,
  onPaginationChange,
}) => {
  const handlePageChange = (page: number, pageSize: number) => {
    onPaginationChange(page, pageSize);
  };

  const handlePageSizeChange = (value: number) => {
    // Assuming onPaginationChange handles changing both page and pageSize,
    // reset to page 1 when page size changes.
    onPaginationChange(1, value);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Table
        rowKey="id"
        columns={columns} // Using locally defined columns
        dataSource={data}
        loading={loading}
        pagination={false} // Handle pagination manually below
        scroll={{ x: "max-content", y: 300 }}
      />

      {/* Custom Pagination Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          flexWrap: "wrap", // Added flexWrap
          gap: 16, // Added gap for spacing on wrap
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            style={{ width: 120 }}
          >
            {[10, 20, 50, 100].map((size) => (
              <Select.Option key={size} value={size}>
                {size} / page
              </Select.Option>
            ))}
          </Select>
          <span>
            {pagination.total !== undefined &&
            pagination.current !== undefined &&
            pagination.pageSize !== undefined
              ? `${(pagination.current - 1) * pagination.pageSize + 1}-${
                  (pagination.current - 1) * pagination.pageSize + data.length
                } of ${pagination.total} items`
              : ""}
          </span>
        </div>

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger={false} // Size changer is handled by the Select above
          onChange={handlePageChange}
          disabled={loading} // Disable pagination controls while loading
        />
      </div>
    </Space>
  );
};

export default UserTableDisplay;
