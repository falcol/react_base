import { Button, Form } from "antd";
import { FormProvider, useForm } from "react-hook-form";
import { SelectParent } from "../components/SelectParent";

export default function SelectParentChildPage() {
  const methods = useForm({
    defaultValues: { province: undefined, district: undefined },
  });

  // Cấu hình các API cha-con
  const apis = [
    {
      name: "province",
      label: "Tỉnh/Thành phố",
      apiUrl: "/select-parents",
      getParams: () => ({ level: "province" }),
    },
    {
      name: "district",
      label: "Quận/Huyện",
      apiUrl: "/select-parents",
      getParams: (values: any) => ({
        level: "district",
        parent: values.province,
      }),
    },
    // Có thể mở rộng thêm cấp nữa...
  ];

  return (
    <FormProvider {...methods}>
      <Form layout="vertical">
        <SelectParent apis={apis} />
        <Button
          type="primary"
          onClick={methods.handleSubmit((data) => {
            alert(JSON.stringify(data, null, 2));
          })}
        >
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}
