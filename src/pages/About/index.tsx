import { Alert, Space, Typography } from 'antd';

import styles from './index.module.less';

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <Space orientation="vertical" size="large">
          <Typography.Title>关于</Typography.Title>
          <Alert
            title="路由懒加载"
            description="当前页面及其 Less 模块会在访问时按需加载。"
            type="info"
            showIcon
          />
        </Space>
      </section>
    </main>
  );
}
