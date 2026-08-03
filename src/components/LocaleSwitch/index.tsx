import languages, { getLanguage } from '@/i18n/languages';
import { GlobalOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t, i18n } = useTranslation('localeSwitch');
  const { locale } = getLanguage(i18n.resolvedLanguage);
  const options = languages.map((language) => ({
    label: language.label,
    value: language.locale,
  }));

  return (
    <Select
      size="small"
      value={locale}
      options={options}
      prefix={<GlobalOutlined />}
      aria-label={t('label')}
      onChange={(value) => void i18n.changeLanguage(value)}
    />
  );
};
