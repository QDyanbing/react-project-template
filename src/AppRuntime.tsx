import { App } from "antd";
import { useEffect } from "react";
import { setMessageHandler } from "@/utils/message";

export default function AppRuntime() {
  const app = App.useApp();

  useEffect(() => {
    setMessageHandler((type, content) => {
      void app.message[type](content);
    });

    return () => {
      setMessageHandler(null);
    };
  }, [app]);

  return null;
}
