import { Table, TableProps, Select, Pagination } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchApi, SearchParams } from "../api/api.search";

interface SearchTableProps<T>
  extends Omit<TableProps<T>, "dataSource" | "loading"> {
  columns: TableProps<T>["columns"];
  searchParams: Record<string, string>;
}

export default function SearchTable<T extends object>({
  columns,
  searchParams,
  ...props
}: SearchTableProps<T>) {
  const [searchParamsState, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parseInt(searchParamsState.get("page") || "1");
  const pageSize = parseInt(searchParamsState.get("pageSize") || "50");

  const { data, isLoading } = useQuery({
    queryKey: ["search", { ...searchParams, page, pageSize }],
    queryFn: async ({ signal }) => {
      const params: SearchParams = {
        ...searchParams,
        page,
        pageSize,
      };
      return searchApi(params);
    },
  });

  const handleTableChange = (newPagination: {
    current: number;
    pageSize: number;
  }) => {
    const params = new URLSearchParams(searchParamsState);
    params.set("page", newPagination.current.toString());
    params.set("pageSize", newPagination.pageSize.toString());
    setSearchParams(params);
  };

  return (
    <>
      <Table<T>
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={false}
        scroll={{ x: "max-content", y: 300 }}
        {...props}
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
            value={pageSize}
            onChange={(value) =>
              handleTableChange({
                current: 1,
                pageSize: value,
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
            {data?.recordTotal
              ? `${(page - 1) * pageSize + 1}-${
                  (page - 1) * pageSize + (data?.data?.length || 0)
                } of ${data?.recordTotal} items`
              : ""}
          </span>
        </div>

        <Pagination
          current={page}
          pageSize={pageSize}
          total={data?.recordTotal}
          showSizeChanger={false}
          onChange={(newPage) =>
            handleTableChange({
              current: newPage,
              pageSize,
            })
          }
        />
      </div>
    </>
  );
}
