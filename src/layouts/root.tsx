import { ProjectOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { Flex, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import Header from './header';
import styles from './root.module.less';

export default () => {
  const { t } = useTranslation('layout');
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const selectedKeys = pathname.startsWith('/home') ? ['/home'] : [];
  const items = [{ key: '/home', icon: <ProjectOutlined />, label: t('projectManagement') }];

  return (
    <Flex vertical className={styles.layout}>
      <Header />
      <Flex flex={1} className={styles.body}>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          className={styles.menu}
          onClick={({ key }) => navigate({ to: key })}
        />
        <Flex vertical flex={1} className={styles.content}>
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  );
};
