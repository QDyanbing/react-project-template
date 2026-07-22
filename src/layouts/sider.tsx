import { ProjectOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Layout, Menu } from "antd";

interface Props {
  collapsed: boolean;
}

const items = [{ key: "/home", icon: <ProjectOutlined />, label: "项目管理" }];

export default ({ collapsed }: Props) => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const selectedKeys = pathname.startsWith("/home") ? ["/home"] : [];

  return (
    <Layout.Sider theme="dark" collapsed={collapsed}>
      <Menu
        theme="dark"
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        onClick={({ key }) => navigate({ to: key })}
      />
    </Layout.Sider>
  );
};
