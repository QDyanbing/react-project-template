import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Button, Flex, Input } from 'antd';
import styles from './index.module.less';
import usePage from '../../models/usePage';

export default () => {
  const { params, onSearch } = usePage();

  const navigate = useNavigate();

  return (
    <Flex gap="medium" justify="space-between" className={styles.searchBar}>
      <Flex gap="medium">
        <Input.Search
          allowClear
          enterButton="查询"
          placeholder="请输入项目名称或描述"
          className={styles.search}
          defaultValue={params.keyword}
          onSearch={onSearch}
        />
      </Flex>
      <Flex gap="medium">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate({ to: '/home/create' })}
        >
          新增项目
        </Button>
      </Flex>
    </Flex>
  );
};
