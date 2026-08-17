import languages, { getLanguage } from '@/i18n/languages';
import { DownOutlined, GlobalOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

interface Props {
  variant?: 'default' | 'inverse';
}

export default ({ variant = 'default' }: Props) => {
  const { t, i18n } = useTranslation('localeSwitch');
  const { label, locale } = getLanguage(i18n.resolvedLanguage);

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        selectable: true,
        items: languages.map((language) => ({
          key: language.locale,
          label: language.label,
        })),
        selectedKeys: [locale],
        onClick: ({ key }) => void i18n.changeLanguage(key),
      }}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className={clsx(styles.localeSwitch, {
          [styles.inverse]: variant === 'inverse',
        })}
        aria-label={t('label')}
      >
        <Flex align="center" gap="small" component="span">
          {label}
          <DownOutlined />
        </Flex>
      </Button>
    </Dropdown>
  );
};
