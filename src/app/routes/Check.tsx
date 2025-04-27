import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table,
} from "antd";
import { useState } from "react";

interface Test {
  test_no: string;
  test_title: string;
  test_code: string;
  test_person: string;
  test_name: string;
}

const { Option } = Select;

const columns = [
  {
    title: "Test No",
    dataIndex: "test_no",
    key: "test_no",
  },
  {
    title: "Tiêu đề",
    dataIndex: "test_title",
    key: "test_title",
  },
  {
    title: "Mã khách hàng",
    dataIndex: "test_code",
    key: "test_code",
  },
  {
    title: "Người liên hệ",
    dataIndex: "test_person",
    key: "test_person",
  },
  {
    title: "Quản lý",
    dataIndex: "test_name",
    key: "test_name",
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, record) => (
      <div className="d-flex gap-2">
        <Button type="primary" size="small" onClick={() => ""}>
          Thông tin Test
        </Button>
        <Button type="default" size="small" onClick={() => ""}>
          Tải xuống
        </Button>
      </div>
    ),
  },
];

const Check = () => {
  const [form] = Form.useForm();
  const [test_source, settest_source] = useState<Test[]>([
    {
      test_no: "GDT001",
      test_title: "Test 1",
      test_code: "KH001",
      test_person: "Nguyễn Văn A",
      test_name: "Trần Minh B",
    },
    {
      test_no: "GDT002",
      test_title: "Test 2",
      test_code: "KH002",
      test_person: "Lê Thị C",
      test_name: "Phan Quốc D",
    },
    {
      test_no: "GDT003",
      test_title: "Test 3",
      test_code: "KH003",
      test_person: "Trần Thị E",
      test_name: "Lê Tuấn F",
    },
  ]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: 20,
  });

  const handleSearch = (values: any) => {
    console.log(values);
    // Thực hiện API tìm kiếm tại đây
    // Sau khi lấy dữ liệu, cập nhật state `test_source` và `pagination`
  };

  return (
    <div className="mx-0 w-100">
      <h2 className="text-primary mb-4">Table</h2>
      <Card className="mb-3">
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left" // Align label to the left
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            {/* Test No */}
            <Col span={12}>
              <Form.Item
                label="Test No"
                name="test_no"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Select test no"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="1">Test 1</Option>
                  <Option value="2">Test 2</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Tiêu đề */}
            <Col span={12}>
              <Form.Item
                label="Tiêu đề"
                name="test_title"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Trạng thái */}
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="approval_stt"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="pending">Đang chờ</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Quản lý */}
            <Col span={12}>
              <Form.Item
                label="Quản lý"
                name="test_name"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Chọn quản lý"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="manager1">Quản lý 1</Option>
                  <Option value="manager2">Quản lý 2</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Mã khách hàng */}
            <Col span={12}>
              <Form.Item
                label="Mã khách hàng"
                name="test_code"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="customer1">Khách hàng 1</Option>
                  <Option value="customer2">Khách hàng 2</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Ngày đăng ký */}
            <Col span={12}>
              <Form.Item
                label="Ngày đăng ký"
                name="register_date"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <DatePicker.RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Checkbox Tất cả Test */}
            <Col span={12}>
              <Form.Item
                name="test_source"
                valuePropName="checked"
                label="Tất cả Test"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Checkbox />
              </Form.Item>
            </Col>

            {/* Loại Test */}
            <Col span={12}>
              <Form.Item
                label="Loại Test"
                name="discussion_category"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Chọn loại Test"
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="category1">Loại 1</Option>
                  <Option value="category2">Loại 2</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Nút tìm kiếm và tạo Test mới */}
            <Col span={24}>
              <Button type="primary" htmlType="submit" className="me-3">
                Tìm kiếm
              </Button>
              <Button
                type="default"
                onClick={() => form.resetFields()}
                className="me-3"
              >
                Xóa
              </Button>
              <Button type="default">Tạo Test mới</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={test_source}
          pagination={pagination}
          onChange={(pagination) => {
            setPagination(pagination);
            // Call API to fetch new data based on pagination
          }}
          rowKey="test_no" // Assuming 'test_no' is unique for each row
        />
      </div>
    </div>
  );
};

export default Check;
