import { App } from "antd";
import { useRequest } from "ahooks";

import { setDelete } from "@/services/home";
import useData from "../models/useData";

export default () => {
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setDelete, { manual: true });

  const onDelete = async (uuid: string) => {
    const result = await runAsync(uuid);
    if (!result) return;

    message.success("项目删除成功");
    useData.getState().onRefresh();
  };

  return {
    loading,
    onDelete,
  };
};
