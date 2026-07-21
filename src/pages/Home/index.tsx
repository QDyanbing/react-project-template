import { ReloadOutlined } from '@ant-design/icons';
import { Button, Input, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useEffect } from 'react';

import styles from './index.module.less';
import useData from './models/useData';
import usePage from './models/usePage';

const columns = [
  {
    title: '项目名称',
    dataIndex: 'name',
  },
  {
    title: '负责人',
    dataIndex: 'owner',
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
  },
] satisfies NonNullable<TableProps<API.HomeData>['columns']>;

export default function HomePage() {
  const params = usePage((state) => state.params);
  const mount = usePage((state) => state.mount);
  const unmount = usePage((state) => state.unmount);
  const onSearch = usePage((state) => state.onSearch);
  const onPaginationChange = usePage(
    (state) => state.onPaginationChange,
  );
  const { data, loading, onRefresh, total } = useData();

  useEffect(() => {
    mount();

    return unmount;
  }, [mount, unmount]);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Typography.Title level={2}>项目列表</Typography.Title>
          <Typography.Paragraph>
            使用页面模型管理查询条件、分页状态和列表请求。
          </Typography.Paragraph>
        </header>

        <div className={styles.toolbar}>
          <Input.Search
            allowClear
            className={styles.search}
            defaultValue={params.keyword}
            disabled={loading}
            enterButton="查询"
            loading={loading}
            placeholder="请输入项目名称或负责人"
            onSearch={onSearch}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onRefresh}
          >
            刷新
          </Button>
        </div>

        <Table<API.HomeData>
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: params.pageNum,
            disabled: loading,
            pageSize: params.pageSize,
            showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            total,
            onChange: onPaginationChange,
          }}
          rowKey="id"
        />
      </section>
    </main>
  );
}
