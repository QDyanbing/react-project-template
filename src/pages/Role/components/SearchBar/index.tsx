import Permission from '@/components/Permission';
import { onHistoryChange } from '@/utils/history';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import usePage from '../../models/usePage';
import styles from './index.module.less';

export default () => {
  const { params, onSearch } = usePage();

  const { t } = useTranslation('role');

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
      </Flex>
      <Flex gap="medium">
        <Permission permissions="role:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onHistoryChange('/roles/create')}
          >
            {t('action.create')}
          </Button>
        </Permission>
      </Flex>
    </Flex>
  );
};
