import { useNavigate } from "@tanstack/react-router";
import { Button, Result } from "antd";

export default () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="页面不存在"
      subTitle="访问地址可能有误，或页面已经被移除。"
      extra={
        <Button type="primary" onClick={() => navigate({ to: "/" })}>
          返回首页
        </Button>
      }
    />
  );
};
