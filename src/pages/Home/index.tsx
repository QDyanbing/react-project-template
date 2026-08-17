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
  'zh-CN': 160,
  'en-US': 180,
};

export default () => {
  const { t } = useTranslation('home');
  const { mount, unmount, params, onPaginationChange } = usePage();
  const { loading, total, data } = useData();

  const { loading: deleteLoading, onDelete } = useDelete();

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
      width: getLocaleValue(ACTION_COLUMN_WIDTH),
      title: t('columns.action'),
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space size="medium">
          <Button
            type="link"
            className={styles.btn}
            onClick={() => onHistoryChange('/home/detail', { uuid })}
          >
            {t('actions.detail')}
          </Button>
          <Button
            type="link"
            className={styles.btn}
            onClick={() => onHistoryChange('/home/modify', { uuid })}
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
        showTotal={showTotal}
        onChange={onPaginationChange}
      />
    </Spin>
  );
};
