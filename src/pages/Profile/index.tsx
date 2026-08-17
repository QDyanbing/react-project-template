import useCurrentUser from '@/models/useCurrentUser';
import { onHistoryChange } from '@/utils/history';
import { EditOutlined } from '@ant-design/icons';
import { Button, Descriptions, Space, Spin, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

export default () => {
  const { loading, data } = useCurrentUser();

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

  return (
    <Spin spinning={loading} classNames={{ root: styles.profile, container: styles.container }}>
      <Descriptions
        bordered
        column={2}
        items={items}
        title={t('title')}
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onHistoryChange('/profile/modify')}
          >
            {t('modify')}
          </Button>
        }
      />
    </Spin>
  );
};
