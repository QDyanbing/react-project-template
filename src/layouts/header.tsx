import LocaleSwitch from '@/components/LocaleSwitch';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Button, Dropdown, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './header.module.less';

export default () => {
  const { t } = useTranslation('layout');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate({ to: '/login', replace: true });
  };

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
            onClick: handleLogout,
          }}
        >
          <Button variant="text" color="primary" icon={<UserOutlined />} className={styles.user}>
            {t('administrator')}
          </Button>
        </Dropdown>
      </Flex>
    </Flex>
  );
};
