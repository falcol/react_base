import { Button, Form } from "antd";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SelectParent } from "../components/SelectParent";

export default function SelectParentChildPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy state từ URL nếu có
  const defaultValues = {
    province: searchParams.get("province") || undefined,
    district: searchParams.get("district") || undefined,
    ward: searchParams.get("ward") || undefined,
  };

  const methods = useForm({ defaultValues });

  // Cấu hình các API cha-con
  const apis = [
    {
      name: "province",
      label: "Tỉnh/Thành phố",
      apiUrl: "/select-parents",
      getParams: () => ({ level: "province", pageSize: 10 }),
    },
    {
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
    {
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
  ];

  // Khi submit, update lên URL
  const onSubmit = (data: any) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <FormProvider {...methods}>
      <Form layout="vertical">
        <SelectParent apis={apis} />
        <Button type="primary" onClick={methods.handleSubmit(onSubmit)}>
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}
