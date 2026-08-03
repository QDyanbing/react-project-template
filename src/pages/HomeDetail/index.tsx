import useUrlState from '@/hooks/useUrlState';
import onBack from '@/utils/onBack';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import type { DescriptionsProps } from 'antd';
import { Button, Descriptions, Empty, Flex, Spin } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';
import useDetail from './models/useDetail';
import usePage from './models/usePage';

export default () => {
  const { t } = useTranslation('homeDetail');
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
        { key: 'name', label: t('name'), children: data.name },
        {
          key: 'description',
          label: t('description'),
          children: data.description || '—',
        },
      ]
    : [];

  return (
    <Spin spinning={loading} classNames={{ root: styles.homeDetail, container: styles.container }}>
      <Flex justify="space-between" className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => onBack('/home')}>
          {t('back')}
        </Button>
        <Button type="primary" onClick={() => navigate({ to: '/home/modify', search: { uuid } })}>
          {t('modify')}
        </Button>
      </Flex>
      <Flex flex={1} className={styles.body}>
        {!data && <Empty />}
        <Descriptions bordered column={1} items={items} className={styles.content} />
      </Flex>
    </Spin>
  );
};
