import { Descriptions, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';

export default () => {
  const { data } = useCurrentUser();

  const { t } = useTranslation('profile');

  const items = [
    { key: 'account', label: t('account'), children: data?.account },
    { key: 'name', label: t('name'), children: data?.name },
    { key: 'email', label: t('email'), children: data?.email },
    { key: 'phone', label: t('phone'), children: data?.phone },
    {
      key: 'roles',
      label: t('roles'),
      span: 'filled' as const,
      children: (
        <Space wrap size="small">
          {data?.roles.map((role) => (
            <Tag key={role.uuid}>{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'permissions',
      label: t('permissions'),
      span: 'filled' as const,
      children: (
        <Space wrap size="small">
          {data?.permissions.map((permission) => (
            <Tag key={permission.code}>{`${permission.name} (${permission.code})`}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  return <Descriptions bordered column={2} items={items} />;
};
