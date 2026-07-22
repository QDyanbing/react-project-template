import { Outlet } from "@tanstack/react-router";
import { Layout } from "antd";
import { useState } from "react";
import Header from "./header";
import Sider from "./sider";
import styles from "./root.module.less";

export default () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout hasSider className={styles.layout}>
      <Sider collapsed={collapsed} />
      <Layout>
        <Header
          collapsed={collapsed}
          onCollapse={() => setCollapsed((value) => !value)}
        />
        <Layout.Content>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
