import LocaleSwitch from '@/components/LocaleSwitch';
import useCurrentUser from '@/models/useCurrentUser';
import { CodeOutlined, DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Dropdown, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './header.module.less';
import useLogout from './hooks/useLogout';

export default () => {
  const { data } = useCurrentUser();

  const { loading, onLogout } = useLogout();

  const { t } = useTranslation('layout');

  return (
    <Flex align="center" component="header" justify="space-between" className={styles.header}>
      <Flex align="center" gap="small" className={styles.brand}>
        <Avatar shape="square" icon={<CodeOutlined />} className={styles.logo} />
        <Typography.Text strong className={styles.brandText}>
          {t('brand')}
        </Typography.Text>
      </Flex>
      <Flex align="center" gap="small">
        <LocaleSwitch variant="inverse" />
        <Divider orientation="vertical" className={styles.divider} />
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [{ key: 'logout', icon: <LogoutOutlined />, label: t('logout') }],
            onClick: onLogout,
          }}
        >
          <Button type="text" loading={loading} icon={<UserOutlined />} className={styles.account}>
            <Flex align="center" gap="small" component="span">
              {data?.name ?? t('administrator')}
              <DownOutlined />
            </Flex>
          </Button>
        </Dropdown>
      </Flex>
    </Flex>
  );
};
