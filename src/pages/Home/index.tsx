import { useNavigate } from '@tanstack/react-router';
import { Button, Pagination, Popconfirm, Space, Spin, Table } from 'antd';
import { useEffect } from 'react';
import styles from './index.module.less';
import SearchBar from './components/SearchBar';
import useDelete from './hooks/useDelete';
import useData from './models/useData';
import usePage from './models/usePage';

export default () => {
  const { mount, unmount, params, onPaginationChange } = usePage();
  const { loading, total, data } = useData();

  const { loading: deleteLoading, onDelete } = useDelete();

  const navigate = useNavigate();

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
    },
    {
      title: '项目描述',
      dataIndex: 'description',
    },
    {
      width: 180,
      title: '操作',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space size="medium">
          <Button
            type="link"
            className={styles.btn}
            onClick={() => navigate({ to: '/home/detail', search: { uuid } })}
          >
            详情
          </Button>
          <Button
            type="link"
            className={styles.btn}
            onClick={() => navigate({ to: '/home/modify', search: { uuid } })}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除该项目？" onConfirm={() => onDelete(uuid)}>
            <Button danger type="link" className={styles.btn}>
              删除
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
        showTotal={(value) => `共 ${value} 条`}
        onChange={onPaginationChange}
      />
    </Spin>
  );
};
