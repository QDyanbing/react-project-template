import AppRuntime from '@/AppRuntime';
import { getLanguage } from '@/i18n/languages';
import theme from '@/theme';
import variables from '@/theme/variables';
import { router } from '@config/router';
import { RouterProvider } from '@tanstack/react-router';
import { App as AntdApp, ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { i18n } = useTranslation();
  const { antd: locale } = getLanguage(i18n.resolvedLanguage);

  return (
    <ConfigProvider locale={locale} theme={theme}>
      <AntdApp className="app" style={variables} message={{ maxCount: 1 }}>
        <AppRuntime />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
