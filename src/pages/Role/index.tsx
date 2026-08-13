import Permission from '@/components/Permission';
import { onHistoryChange } from '@/utils/history';
import { Button, Pagination, Popconfirm, Space, Spin, Table, Typography } from 'antd';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import SearchBar from './components/SearchBar';
import useDelete from './hooks/useDelete';
import styles from './index.module.less';
import useData from './models/useData';
import usePage from './models/usePage';

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
      width: 180,
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
        showTotal={(value) => (
          <Trans
            i18nKey="pagination.total"
            t={t}
            values={{ count: value }}
            components={{ count: <Typography.Text strong type="success" /> }}
          />
        )}
        onChange={onPaginationChange}
      />
    </Spin>
  );
};
