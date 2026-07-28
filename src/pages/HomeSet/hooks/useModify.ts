import { useNavigate } from "@tanstack/react-router";
import { App } from "antd";
import { useRequest } from "ahooks";

import { setModify } from "@/services/home";
import usePage from "../models/usePage";

export default () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setModify, { manual: true });

  const onModify = async (data: API.HomeSetParams) => {
    const { uuid } = usePage.getState();
    if (!uuid) return;

    const result = await runAsync(uuid, data);
    if (!result) return;

    message.success("项目修改成功");
    navigate({ to: "/home" });
  };

  return { loading, onModify };
};
