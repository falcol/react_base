import CustomButton from "@/components/CustomButton";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Spin } from "antd";

import { Input, Pagination, Select, Space, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([
      { title: "Trang chủ" },
      { title: "Người dùng" },
      { title: "Danh sách" },
    ]);
  }, [setBreadcrumb]);

  // Fetch email options
  const fetchEmailOptions = async (page: number, search: string = "") => {
    setEmailLoading(true);
    try {
      const limit = 5; // mỗi lần lấy 5 email
      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit,
          skip: page * limit,
        },
      });

      let users = res.data.users;

      // Nếu có search text thì filter tiếp
      if (search) {
        users = users.filter((user) =>
          user.email.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const newEmails = users.map((user) => user.email);
      setEmailOptions((prev) => [...prev, ...newEmails]);
      setEmailHasMore(users.length === limit); // Nếu ít hơn limit thì hết rồi
      setEmailPage(page);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchData = async (
    page = 1,
    pageSize = 10,
    field = "",
    value = "",
    email: string | null = null,
  ) => {
    setLoading(true);
    try {
      const res = await axios.get<ApiResponse>("https://dummyjson.com/users", {
        params: {
          limit: pageSize,
          skip: (page - 1) * pageSize,
        },
      });

      let users = res.data.users;

      if (email) {
        users = users.filter((user) => user.email === email);
      } else if (field && value) {
        users = users.filter((user) =>
          String((user as any)[field])
            .toLowerCase()
            .includes(value.toLowerCase()),
        );
      }

      setData(users);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: res.data.total,
      }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailOptions(0);
  }, []);

  // Load từ URL
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const field = searchParams.get("searchField") || "firstName";
    const value = searchParams.get("searchValue") || "";
    const email = searchParams.get("email");

    setSearchField(field);
    setSearchValue(value);
    setSelectedEmail(email || null);

    fetchData(page, pageSize, field, value, email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTableChange = (config: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = config;
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
    } else {
      if (value) {
        params.set("searchField", field);
        params.set("searchValue", value);
      }
    }
    navigate(`?${params.toString()}`, { replace: true });

    fetchData(page, pageSize, field, value, email);
  };

  const handleSearch = () => {
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
    updateURL(1, pagination.pageSize || 10, "firstName", "", null);
  };

  const handleEmailSearch = (value: string) => {
    // Khi nhập search trong select, reset lại email list
    setEmailOptions([]);
    setEmailPage(0);
    setEmailHasMore(true);
    fetchEmailOptions(0, value);
  };

  const handleEmailScroll = (e: any) => {
    const target = e.target;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      if (emailHasMore && !emailLoading) {
        fetchEmailOptions(emailPage + 1);
      }
    }
  };

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
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Form Search */}
      <div style={{ display: "flex", gap: 8 }}>
        {/* Email select */}
        <Select
          showSearch
          allowClear
          placeholder="Select email..."
          value={selectedEmail || undefined}
          onChange={(value) => setSelectedEmail(value || null)}
          onSearch={handleEmailSearch}
          onPopupScroll={handleEmailScroll}
          loading={emailLoading}
          style={{ width: 250 }}
          filterOption={false}
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

        {/* Nếu không chọn email mới show field search */}
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

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content", y: 300 }}
      />

      {/* Pagination */}
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
            onChange={(value) =>
              handleTableChange({
                ...pagination,
                pageSize: value,
                current: 1,
              })
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
            {pagination.total
              ? `${(pagination.current! - 1) * pagination.pageSize! + 1}-${
                  (pagination.current! - 1) * pagination.pageSize! + data.length
                } of ${pagination.total} items`
              : ""}
          </span>
        </div>

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger={false}
          onChange={(page) =>
            handleTableChange({
              ...pagination,
              current: page,
            })
          }
        />
      </div>
    </Space>
  );
}
