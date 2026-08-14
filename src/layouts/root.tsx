import useCurrentUser from '@/models/useCurrentUser';
import { hasPermission } from '@/utils/access';
import { onHistoryChange } from '@/utils/history';
import { ProjectOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { Outlet, useLocation } from '@tanstack/react-router';
import { Flex, Menu } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './header';
import styles from './root.module.less';

export default () => {
  const { data, mount, unmount } = useCurrentUser();

  const pathname = useLocation({ select: (location) => location.pathname });

  const { t } = useTranslation('layout');

  const items = [
    { key: '/home', icon: <ProjectOutlined />, label: t('projectManagement') },
    ...(hasPermission(data?.permissions ?? [], ['user:view'])
      ? [{ key: '/users', icon: <TeamOutlined />, label: t('userManagement') }]
      : []),
    ...(hasPermission(data?.permissions ?? [], ['role:view'])
      ? [{ key: '/roles', icon: <SafetyCertificateOutlined />, label: t('roleManagement') }]
      : []),
  ];
  const selectedKeys = items.filter(({ key }) => pathname.startsWith(key)).map(({ key }) => key);

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
