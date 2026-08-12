import useCurrentUser from '@/models/useCurrentUser';
import { onHistoryChange } from '@/utils/history';
import { ProjectOutlined } from '@ant-design/icons';
import { Outlet, useLocation } from '@tanstack/react-router';
import { Flex, Menu } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './header';
import styles from './root.module.less';

export default () => {
  const { mount, unmount } = useCurrentUser();

  const pathname = useLocation({ select: (location) => location.pathname });

  const { t } = useTranslation('layout');

  const selectedKeys = pathname.startsWith('/home') ? ['/home'] : [];
  const items = [{ key: '/home', icon: <ProjectOutlined />, label: t('projectManagement') }];

  useEffect(() => {
    mount();

    return unmount;
  }, [mount, unmount]);

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
          onClick={({ key }) => onHistoryChange(key)}
        />
        <Flex vertical flex={1} className={styles.content}>
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  );
};
