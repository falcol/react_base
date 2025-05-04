import { useQuery } from "@tanstack/react-query";
import { Pagination, Select, Table, TableProps } from "antd";
import Cookies from "js-cookie";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface SearchResponse<T> {
  data: T[];
  recordTotal: number;
}

export interface SearchApiParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

interface SearchTableProps<T>
  extends Omit<TableProps<T>, "dataSource" | "loading"> {
  columns: TableProps<T>["columns"];
  searchParams: Record<string, string>;
  api: (params: SearchApiParams) => Promise<SearchResponse<T>>;
}

export default function SearchTable<T extends object>({
  columns,
  searchParams,
  api,
  ...props
}: SearchTableProps<T>) {
  const [searchParamsState, setSearchParams] = useSearchParams();

  // Memoize page và pageSize để tránh re-render không cần thiết
  const { page, pageSize } = useMemo(
    () => ({
      page: parseInt(searchParamsState.get("page") || "1"),
      pageSize: parseInt(searchParamsState.get("pageSize") || "50"),
    }),
    [searchParamsState],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["search", { ...searchParams, page, pageSize }],
    queryFn: () => {
      const params: SearchApiParams = { ...searchParams, page, pageSize };
      return api(params);
    },
    placeholderData: (previousData) => previousData,
    enabled: !!Cookies.get("accessToken"),
    // refetchOnWindowFocus: true,
    // refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 1,
  });

  // Memoize handleTableChange để tránh re-render không cần thiết
  const handleTableChange = useCallback(
    ({ current, pageSize }: { current: number; pageSize: number }) => {
      const params = new URLSearchParams(searchParamsState);
      params.set("page", current.toString());
      params.set("pageSize", pageSize.toString());
      setSearchParams(params);
    },
    [searchParamsState, setSearchParams],
  );

  // Memoize pagination info để tránh tính toán lại mỗi lần render
  const paginationInfo = useMemo(() => {
    if (!data?.recordTotal) return "";
    const start = (page - 1) * pageSize + 1;
    const end = (page - 1) * pageSize + (data?.data?.length || 0);
    return `${start}-${end} of ${data.recordTotal} items`;
  }, [data, page, pageSize]);

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
              handleTableChange({ current: 1, pageSize: value })
            }
            style={{ width: 120 }}
          >
            {[10, 20, 50, 100].map((size) => (
              <Select.Option key={size} value={size}>
                {size} / page
              </Select.Option>
            ))}
          </Select>
          <span>{paginationInfo}</span>
        </div>

        <Pagination
          current={page}
          pageSize={pageSize}
          total={data?.recordTotal}
          showSizeChanger={false}
          onChange={(newPage) =>
            handleTableChange({ current: newPage, pageSize })
          }
        />
      </div>
    </>
  );
}
