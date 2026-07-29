import { useNavigate } from '@tanstack/react-router';
import { Button, Descriptions, Flex, Spin, Empty } from 'antd';
import type { DescriptionsProps } from 'antd';
import { useEffect } from 'react';
import useUrlState from '@/hooks/useUrlState';
import onBack from '@/utils/onBack';
import styles from './index.module.less';
import useDetail from './models/useDetail';
import usePage from './models/usePage';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default () => {
  const { mount, unmount } = usePage();
  const { data, loading } = useDetail();

  const navigate = useNavigate();
  const [{ uuid }] = useUrlState<{ uuid?: string }>();

  useEffect(() => {
    mount(uuid);

    return unmount;
  }, [mount, unmount, uuid]);

  const items: DescriptionsProps['items'] = data
    ? [
        { key: 'name', label: '项目名称', children: data.name },
        {
          key: 'description',
          label: '项目描述',
          children: data.description || '—',
        },
      ]
    : [];

  return (
    <Spin spinning={loading} classNames={{ root: styles.homeDetail, container: styles.container }}>
      <Flex justify="space-between" className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => onBack('/home')}>
          返回
        </Button>
        <Button type="primary" onClick={() => navigate({ to: '/home/modify', search: { uuid } })}>
          编辑项目
        </Button>
      </Flex>
      <Flex flex={1} className={styles.body}>
        {!data && <Empty />}
        <Descriptions bordered column={1} items={items} className={styles.content} />
      </Flex>
    </Spin>
  );
};
