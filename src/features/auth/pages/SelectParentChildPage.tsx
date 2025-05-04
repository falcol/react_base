import { Button, Col, Form, Row } from "antd";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SingleSelect } from "../components/SingleSelect";

export default function SelectParentChildPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultValues = {
    province: searchParams.get("province") || undefined,
    district: searchParams.get("district") || undefined,
    ward: searchParams.get("ward") || undefined,
  };

  const methods = useForm({ defaultValues });

  const onSubmit = (data: any) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: true });
  };

  const apis = {
    province: {
      name: "province",
      label: "Tỉnh/Thành phố",
      apiUrl: "/select-parents",
      getParams: () => ({ level: "province", pageSize: 10 }),
    },
    district: {
      name: "district",
      label: "Quận/Huyện",
      apiUrl: "/select-parents",
      getParams: (values: any, search: string, page: number) => ({
        level: "district",
        parent: values.province,
        search,
        page,
        pageSize: 10,
      }),
    },
    ward: {
      name: "ward",
      label: "Phường/Xã",
      apiUrl: "/select-parents",
      getParams: (values: any, search: string, page: number) => ({
        level: "ward",
        parent: values.district,
        search,
        page,
        pageSize: 10,
      }),
    },
  };

  return (
    <FormProvider {...methods}>
      <Form layout="vertical" onFinish={methods.handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={8}>
            <SingleSelect
              apiConfig={apis.province}
              childNames={["district", "ward"]}
            />
          </Col>
          <Col span={8}>
            <SingleSelect
              apiConfig={apis.district}
              parentNames={["province"]}
              childNames={["ward"]}
            />
          </Col>
          <Col span={8}>
            <SingleSelect apiConfig={apis.ward} parentNames={["district"]} />
          </Col>
        </Row>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}
