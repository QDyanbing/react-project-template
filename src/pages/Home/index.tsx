import { useNavigate } from '@tanstack/react-router';
import { Button, Pagination, Popconfirm, Space, Spin, Table, Typography } from 'antd';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import SearchBar from './components/SearchBar';
import useDelete from './hooks/useDelete';
import styles from './index.module.less';
import useData from './models/useData';
import usePage from './models/usePage';

export default () => {
  const { t } = useTranslation('home');
  const { mount, unmount, params, onPaginationChange } = usePage();
  const { loading, total, data } = useData();

  const { loading: deleteLoading, onDelete } = useDelete();

  const navigate = useNavigate();

  const columns = [
    {
      title: t('columns.name'),
      dataIndex: 'name',
    },
    {
      title: t('columns.description'),
      dataIndex: 'description',
    },
    {
      width: 180,
      title: t('columns.action'),
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space size="medium">
          <Button
            type="link"
            className={styles.btn}
            onClick={() => navigate({ to: '/home/detail', search: { uuid } })}
          >
            {t('actions.detail')}
          </Button>
          <Button
            type="link"
            className={styles.btn}
            onClick={() => navigate({ to: '/home/modify', search: { uuid } })}
          >
            {t('actions.modify')}
          </Button>
          <Popconfirm title={t('actions.deleteConfirm')} onConfirm={() => onDelete(uuid)}>
            <Button danger type="link" className={styles.btn}>
              {t('actions.delete')}
            </Button>
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
      classNames={{ root: styles.home, container: styles.container }}
    >
      <SearchBar />
      <Table
        sticky
        rowKey="uuid"
        pagination={false}
        columns={columns}
        dataSource={data}
        className={styles.body}
      />
      <Pagination
        align="end"
        showSizeChanger
        current={params.pageNum}
        disabled={loading}
        pageSize={params.pageSize}
        total={total}
        className={styles.footer}
        showTotal={(value) => (
          <Trans
            t={t}
            i18nKey="pagination.total"
            values={{ count: value }}
            components={{ count: <Typography.Text strong type="success" /> }}
          />
        )}
        onChange={onPaginationChange}
      />
    </Spin>
  );
};
