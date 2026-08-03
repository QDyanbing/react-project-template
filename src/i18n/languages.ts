import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';

const languages = [
  {
    locale: 'zh-CN',
    label: '简体中文',
    match: ['zh'],
    antd: zhCN,
    dayjs: 'zh-cn',
  },
  {
    locale: 'en-US',
    label: 'English',
    match: ['en'],
    antd: enUS,
    dayjs: 'en',
  },
] as const;

export type Language = (typeof languages)[number]['locale'];

export const getLanguage = (locale?: string) => {
  const value = locale?.toLowerCase();

  return (
    languages.find(
      (language) =>
        language.locale.toLowerCase() === value ||
        language.match.some((prefix) => value?.startsWith(prefix)),
    ) ?? languages[0]
  );
};

export default languages;
