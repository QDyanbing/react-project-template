import LocaleSwitch from '@/components/LocaleSwitch';
import useCurrentUser from '@/models/useCurrentUser';
import { onHistoryChange } from '@/utils/history';
import {
  CodeOutlined,
  DownOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
      <Button
        type="text"
        icon={<Avatar shape="square" icon={<CodeOutlined />} className={styles.logo} />}
        className={styles.brand}
        onClick={() => onHistoryChange('/')}
      >
        <Typography.Text strong className={styles.brandText}>
          {t('brand')}
        </Typography.Text>
      </Button>
      <Flex align="center" gap="small">
        <LocaleSwitch variant="inverse" />
        <Divider orientation="vertical" className={styles.divider} />
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [
              { key: 'profile', icon: <UserOutlined />, label: t('profile') },
              { key: 'password', icon: <KeyOutlined />, label: t('modifyPassword') },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: t('logout') },
            ],
            onClick: ({ key }) => {
              if (key === 'profile') {
                onHistoryChange('/profile');
                return;
              }

              if (key === 'password') {
                onHistoryChange('/profile/password');
                return;
              }

              onLogout();
            },
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
