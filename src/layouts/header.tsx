import LocaleSwitch from '@/components/LocaleSwitch';
import useCurrentUser from '@/models/useCurrentUser';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './header.module.less';
import useLogout from './hooks/useLogout';

export default () => {
  const { data } = useCurrentUser();

  const { loading, onLogout } = useLogout();

  const { t } = useTranslation('layout');

  return (
    <Flex align="center" component="header" justify="space-between" className={styles.header}>
      <Flex align="center" className={styles.left}>
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          className={styles.logo}
        />
      </Flex>
      <Flex align="center" gap="middle">
        <LocaleSwitch />
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [{ key: 'logout', icon: <LogoutOutlined />, label: t('logout') }],
            onClick: onLogout,
          }}
        >
          <Button
            variant="text"
            color="primary"
            loading={loading}
            icon={<UserOutlined />}
            className={styles.user}
          >
            {data?.name ?? t('administrator')}
          </Button>
        </Dropdown>
      </Flex>
    </Flex>
  );
};
