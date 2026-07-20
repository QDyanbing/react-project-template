import { CheckCircleOutlined } from '@ant-design/icons';
import { App, Button, Space, Typography } from 'antd';

import styles from './index.module.less';

export default function HomePage() {
  const { message } = App.useApp();

  const showMessage = () => {
    void message.success('组件库已就绪');
  };

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <Space orientation="vertical" size="large">
          <Typography.Title>React 项目模板</Typography.Title>
          <Typography.Paragraph>
            一套基于 React、Vite、TypeScript 和 Ant Design
            搭建的可复用项目基础结构。
          </Typography.Paragraph>
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={showMessage}
          >
            显示消息
          </Button>
        </Space>
      </section>
    </main>
  );
}
