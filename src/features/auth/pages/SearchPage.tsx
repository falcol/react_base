import { Button, Card, DatePicker, Form, Input, Row, Col } from "antd";
import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import SelectWithSearch from "../components/SelectWithSearch";
import SearchTable from "../components/SearchTable";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const searchSchema = z.object({
  application_no: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  manager: z.string().optional(),
  customer_code: z.string().optional(),
  register_date: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  category: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

const columns = [
  {
    title: "Application No",
    dataIndex: "application_no",
    key: "application_no",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Manager",
    dataIndex: "manager",
    key: "manager",
  },
  {
    title: "Customer Code",
    dataIndex: "customer_code",
    key: "customer_code",
  },
  {
    title: "Register Date",
    dataIndex: "register_date",
    key: "register_date",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
  },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { control, handleSubmit, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      application_no: searchParams.get("application_no") || "",
      title: searchParams.get("title") || "",
      status: searchParams.get("status") || "",
      manager: searchParams.get("manager") || "",
      customer_code: searchParams.get("customer_code") || "",
      register_date: {
        start: searchParams.get("register_date_start") || "",
        end: searchParams.get("register_date_end") || "",
      },
      category: searchParams.get("category") || "",
    },
  });

  const formValues = watch();

  const handleSearch = useCallback(
    (data: SearchFormData) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (key === "register_date") {
            if (value.start) params.set("register_date_start", value.start);
            if (value.end) params.set("register_date_end", value.end);
          } else {
            params.set(key, value);
          }
        }
      });
      setSearchParams(params);
    },
    [setSearchParams],
  );

  const searchParamsObject = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Form layout="horizontal" onFinish={handleSubmit(handleSearch)}>
          <Row gutter={16}>
            {/* Cột 1 */}
            <Col span={12}>
              <Form.Item
                label="Application No"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="application_no"
                  control={control}
                  render={({ field }) => (
                    <SelectWithSearch
                      field="application_no"
                      fieldProps={field}
                      placeholder="Application No"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Title"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Title" />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Status"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectWithSearch
                      field="status"
                      fieldProps={field}
                      placeholder="Status"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Manager"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="manager"
                  control={control}
                  render={({ field }) => (
                    <SelectWithSearch
                      field="manager"
                      fieldProps={field}
                      placeholder="Manager"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {/* Cột 2 */}
            <Col span={12}>
              <Form.Item
                label="Customer Code"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="customer_code"
                  control={control}
                  render={({ field }) => (
                    <SelectWithSearch
                      field="customer_code"
                      fieldProps={field}
                      placeholder="Customer Code"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Register Date"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="register_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker.RangePicker
                      onChange={(dates) => {
                        if (dates) {
                          field.onChange({
                            start: dates[0]?.format("YYYY-MM-DD") || "",
                            end: dates[1]?.format("YYYY-MM-DD") || "",
                          });
                        } else {
                          field.onChange(null);
                        }
                      }}
                      style={{ width: "100%" }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Category"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectWithSearch
                      field="category"
                      fieldProps={field}
                      placeholder="Category"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <SearchTable
          columns={columns}
          searchParams={searchParamsObject}
          rowKey="application_no"
        />
      </Card>
    </div>
  );
}
