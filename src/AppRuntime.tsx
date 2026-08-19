import { setMessageHandler } from '@/utils/message';
import { App } from 'antd';
import { useEffect } from 'react';

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
