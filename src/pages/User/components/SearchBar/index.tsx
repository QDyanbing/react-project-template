import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import Permission from '@/components/Permission';
import { onHistoryChange } from '@/utils/history';
import usePage from '../../models/usePage';
import styles from './index.module.less';

export default () => {
  const { params, onSearch, onStatusChange } = usePage();

  const { t } = useTranslation('user');

  return (
    <Flex gap="medium" justify="space-between" className={styles.searchBar}>
      <Flex flex="auto" gap="medium">
        <Input.Search
          allowClear
          enterButton
          defaultValue={params.keyword}
          placeholder={t('search.keyword')}
          className={styles.search}
          onSearch={onSearch}
        />
        <Select
          allowClear
          options={[
            { value: 'enabled', label: t('status.enabled') },
            { value: 'disabled', label: t('status.disabled') },
          ]}
          value={params.status}
          aria-label={t('search.status')}
          placeholder={t('search.status')}
          onChange={onStatusChange}
        />
      </Flex>
      <Flex gap="medium">
        <Permission permissions="user:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onHistoryChange('/users/create')}
          >
            {t('action.create')}
          </Button>
        </Permission>
      </Flex>
    </Flex>
  );
};
