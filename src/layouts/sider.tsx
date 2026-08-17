import useCurrentUser from '@/models/useCurrentUser';
import { hasPermission } from '@/utils/access';
import { onHistoryChange } from '@/utils/history';
import { ProjectOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useLocation } from '@tanstack/react-router';
import { Flex, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './sider.module.less';

export default () => {
  const { data } = useCurrentUser();

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

  return (
    <Flex vertical className={styles.sider}>
      <Menu
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        className={styles.menu}
        onClick={({ key }) => onHistoryChange(key)}
      />
    </Flex>
  );
};
