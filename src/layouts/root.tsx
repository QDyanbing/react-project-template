import useCurrentUser from '@/models/useCurrentUser';
import { Outlet } from '@tanstack/react-router';
import { Flex } from 'antd';
import { useEffect } from 'react';
import Header from './header';
import styles from './root.module.less';
import Sider from './sider';

export default () => {
  const { mount, unmount } = useCurrentUser();

  useEffect(() => {
    mount();

    return unmount;
  }, [mount, unmount]);

  return (
    <Flex vertical className={styles.layout}>
      <Header />
      <Flex flex={1} className={styles.body}>
        <Sider />
        <Flex vertical flex={1} className={styles.content}>
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  );
};
