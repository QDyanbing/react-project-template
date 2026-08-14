import Permission from '@/components/Permission';
import useUrlState from '@/hooks/useUrlState';
import { formatTime } from '@/utils/format';
import { onHistoryBack, onHistoryChange } from '@/utils/history';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Descriptions, Flex, Space, Spin, Tag } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';
import useDetail from './models/useDetail';
import usePage from './models/usePage';

export default () => {
  const { mount, unmount } = usePage();
  const { loading, data } = useDetail();

  const [{ userId }] = useUrlState<{ userId?: string }>();

  const { t } = useTranslation('userDetail');

  const items = [
    { key: 'account', label: t('account'), children: data?.account },
    { key: 'name', label: t('name'), children: data?.name },
    { key: 'email', label: t('email'), children: data?.email },
    { key: 'phone', label: t('phone'), children: data?.phone },
    {
      key: 'roles',
      label: t('roles'),
      children: (
        <Space wrap size="small">
          {data?.roles.map((role) => (
            <Tag key={role.uuid}>{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'status',
      label: t('status'),
      children: data ? (
        <Tag color={data.status === 'enabled' ? 'success' : 'default'}>{t(data.status)}</Tag>
      ) : undefined,
    },
    {
      key: 'gmtCreate',
      label: t('gmtCreate'),
      children: data ? formatTime(data.gmtCreate) : undefined,
    },
  ];

  useEffect(() => {
    mount(userId);

    return unmount;
  }, [mount, unmount, userId]);

  return (
    <Spin spinning={loading} classNames={{ root: styles.userDetail, container: styles.container }}>
      <Flex justify="space-between">
        <Button icon={<ArrowLeftOutlined />} onClick={() => onHistoryBack('/users')}>
          {t('back')}
        </Button>
        <Permission permissions="user:modify">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onHistoryChange('/users/modify', { userId })}
          >
            {t('modify')}
          </Button>
        </Permission>
      </Flex>
      <Descriptions bordered items={items} column={2} />
    </Spin>
  );
};
