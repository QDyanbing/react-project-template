import Permission from '@/components/Permission';
import { getLocaleValue } from '@/i18n';
import { onHistoryChange } from '@/utils/history';
import { showTotal } from '@/utils/pagination';
import { Button, Pagination, Popconfirm, Space, Spin, Table } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from './components/SearchBar';
import useDelete from './hooks/useDelete';
import styles from './index.module.less';
import useData from './models/useData';
import usePage from './models/usePage';

const ACTION_COLUMN_WIDTH = {
  'zh-CN': 144,
  'en-US': 160,
};

export default () => {
  const { mount, unmount, params, onPaginationChange } = usePage();
  const { loading, data, total } = useData();

  const { loading: deleteLoading, onDelete } = useDelete();

  const { t } = useTranslation('role');

  const columns = [
    { title: t('column.name'), dataIndex: 'name' },
    {
      width: 120,
      title: t('column.permissions'),
      dataIndex: 'permissions',
      render: (permissions: API.Permission[]) => permissions.length,
    },
    { width: 120, title: t('column.users'), dataIndex: 'userCount' },
    {
      width: getLocaleValue(ACTION_COLUMN_WIDTH),
      title: t('column.action'),
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space size="small">
          <Button
            type="link"
            className={styles.action}
            onClick={() => onHistoryChange('/roles/detail', { uuid })}
          >
            {t('action.detail')}
          </Button>
          <Permission permissions="role:modify">
            <Button
              type="link"
              className={styles.action}
              onClick={() => onHistoryChange('/roles/modify', { uuid })}
            >
              {t('action.modify')}
            </Button>
          </Permission>
          <Popconfirm title={t('action.deleteConfirm')} onConfirm={() => onDelete(uuid)}>
            <Permission permissions="role:delete">
              <Button danger type="link" className={styles.action}>
                {t('action.delete')}
              </Button>
            </Permission>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    mount();

    return unmount;
  }, [mount, unmount]);

  return (
    <Spin
      spinning={loading || deleteLoading}
      classNames={{ root: styles.role, container: styles.container }}
    >
      <SearchBar />
      <Table
        sticky
        pagination={false}
        rowKey="uuid"
        columns={columns}
        dataSource={data}
        className={styles.body}
      />
      <Pagination
        showSizeChanger
        align="end"
        current={params.pageNum}
        disabled={loading}
        pageSize={params.pageSize}
        total={total}
        className={styles.footer}
        showTotal={showTotal}
        onChange={onPaginationChange}
      />
    </Spin>
  );
};
