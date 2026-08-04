import { onHistoryChange } from '@/utils/history';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import usePage from '../../models/usePage';
import styles from './index.module.less';

export default () => {
  const { t } = useTranslation('home');
  const { params, onSearch } = usePage();

  return (
    <Flex gap="medium" justify="space-between" className={styles.searchBar}>
      <Flex gap="medium">
        <Input.Search
          allowClear
          enterButton={t('search.submit')}
          placeholder={t('search.placeholder')}
          className={styles.search}
          defaultValue={params.keyword}
          onSearch={onSearch}
        />
      </Flex>
      <Flex gap="medium">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onHistoryChange('/home/create')}
        >
          {t('search.create')}
        </Button>
      </Flex>
    </Flex>
  );
};
