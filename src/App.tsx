import { RouterProvider } from "@tanstack/react-router";
import { App as AntdApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import AppRuntime from "@/AppRuntime";
import theme from "@/theme";
import { router } from "@config/router";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntdApp className="app" message={{ maxCount: 1 }}>
        <AppRuntime />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
