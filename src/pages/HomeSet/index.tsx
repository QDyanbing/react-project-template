import { useNavigate } from "@tanstack/react-router";
import { Button, Flex, Form, Input, Spin } from "antd";
import { useEffect } from "react";
import useUrlState from "@/hooks/useUrlState";
import styles from "./index.module.less";
import useCreate from "./hooks/useCreate";
import useModify from "./hooks/useModify";
import useDetail from "./models/useDetail";
import usePage from "./models/usePage";

export default () => {
  const { mount, unmount } = usePage();
  const { loading, data } = useDetail();

  const { loading: createLoading, onCreate } = useCreate();
  const { loading: modifyLoading, onModify } = useModify();

  const navigate = useNavigate();
  const [{ uuid }] = useUrlState<{ uuid?: string }>();
  const [form] = Form.useForm<API.HomeSetParams>();

  const onFinish = async (data: API.HomeSetParams) => {
    if (uuid) {
      await onModify(data);
    } else {
      await onCreate(data);
    }
  };

  useEffect(() => {
    mount(uuid);

    return unmount;
  }, [mount, unmount, uuid]);

  useEffect(() => {
    if (data) {
      const { name, description } = data;
      form.setFieldsValue({ name, description });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  return (
    <Spin
      spinning={loading || createLoading || modifyLoading}
      classNames={{ root: styles.homeSet, container: styles.container }}
    >
      <Flex vertical flex={1} className={styles.body}>
        <Form
          layout="vertical"
          form={form}
          className={styles.content}
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "请输入项目名称",
              },
              { max: 100, message: "项目名称不能超过 100 个字符" },
            ]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ max: 500, message: "项目描述不能超过 500 个字符" }]}
          >
            <Input.TextArea
              showCount
              placeholder="请输入项目描述"
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Flex>
      <Flex gap="medium" justify="flex-end" className={styles.footer}>
        <Button onClick={() => navigate({ to: "/home" })}>取消</Button>
        <Button type="primary" onClick={() => form.submit()}>
          保存
        </Button>
      </Flex>
    </Spin>
  );
};
