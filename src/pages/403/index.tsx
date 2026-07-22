import { useNavigate } from "@tanstack/react-router";
import { Button, Result } from "antd";

export default () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="暂无访问权限"
      subTitle="当前账号无权访问该页面，请联系管理员开通权限。"
      extra={
        <Button type="primary" onClick={() => navigate({ to: "/" })}>
          返回首页
        </Button>
      }
    />
  );
};
