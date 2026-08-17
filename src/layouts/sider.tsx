import useCurrentUser from '@/models/useCurrentUser';
import { hasPermission } from '@/utils/access';
import { onHistoryChange } from '@/utils/history';
import { getStorage, setStorage } from '@/utils/storage';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLocation } from '@tanstack/react-router';
import { Button, Flex, Menu } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './sider.module.less';

const SIDER_COLLAPSED_STORAGE_KEY = 'layout:sider-collapsed';

export default () => {
  const { data } = useCurrentUser();

  const pathname = useLocation({ select: (location) => location.pathname });

  const { t } = useTranslation('layout');

  const [isCollapsed, setIsCollapsed] = useState(
    () => getStorage<boolean>(SIDER_COLLAPSED_STORAGE_KEY) ?? false,
  );

  const items = [
    {
      key: '/home',
      icon: <ProjectOutlined />,
      label: t('projectManagement'),
      requiredPermissions: [],
    },
    {
      key: '/roles',
      icon: <SafetyCertificateOutlined />,
      label: t('roleManagement'),
      requiredPermissions: ['role:view'],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: t('userManagement'),
      requiredPermissions: ['user:view'],
    },
  ]
    .filter(({ requiredPermissions }) =>
      hasPermission(data?.permissions ?? [], requiredPermissions),
    )
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const selectedKeys = items.filter(({ key }) => pathname.startsWith(key)).map(({ key }) => key);
  const collapseLabel = t(isCollapsed ? 'expandMenu' : 'collapseMenu');

  const onCollapseToggle = () => {
    const value = !isCollapsed;

    setIsCollapsed(value);
    setStorage(SIDER_COLLAPSED_STORAGE_KEY, value);
  };

  return (
    <Flex
      vertical
      className={clsx(styles.sider, {
        [styles.collapsed]: isCollapsed,
      })}
    >
      <Menu
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        inlineCollapsed={isCollapsed}
        className={styles.menu}
        onClick={({ key }) => onHistoryChange(key)}
      />
      <Button
        block
        type="text"
        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        className={styles.collapse}
        aria-label={collapseLabel}
        onClick={onCollapseToggle}
      />
    </Flex>
  );
};
