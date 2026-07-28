import { useNavigate } from "@tanstack/react-router";
import { App } from "antd";
import { useRequest } from "ahooks";

import { setCreate } from "@/services/home";

export default () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setCreate, { manual: true });

  const onCreate = async (data: API.HomeSetParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success("项目创建成功");
    navigate({ to: "/home" });
  };

  return { loading, onCreate };
};
