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

  const [{ uuid }] = useUrlState<{ uuid?: string }>();

  const { t } = useTranslation('roleDetail');

  const items = [
    { key: 'name', label: t('name'), children: data?.name },
    { key: 'description', label: t('description'), children: data?.description },
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
    { key: 'users', label: t('users'), children: data?.userCount },
    {
      key: 'gmtCreate',
      label: t('gmtCreate'),
      children: data ? formatTime(data.gmtCreate) : undefined,
    },
  ];

  useEffect(() => {
    mount(uuid);

    return unmount;
  }, [mount, unmount, uuid]);

  return (
    <Spin spinning={loading} classNames={{ root: styles.roleDetail, container: styles.container }}>
      <Flex justify="space-between">
        <Button icon={<ArrowLeftOutlined />} onClick={() => onHistoryBack('/roles')}>
          {t('back')}
        </Button>
        <Permission permissions="role:modify">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onHistoryChange('/roles/modify', { uuid })}
          >
            {t('modify')}
          </Button>
        </Permission>
      </Flex>
      <Descriptions bordered items={items} column={2} />
    </Spin>
  );
};
