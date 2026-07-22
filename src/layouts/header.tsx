import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, Button, Dropdown, Flex, Layout } from "antd";

import styles from "./header.module.less";

interface Props {
  collapsed: boolean;
  onCollapse: () => void;
}

export default ({ collapsed, onCollapse }: Props) => {
  const navigate = useNavigate();

  return (
    <Flex
      align="center"
      justify="space-between"
      component={Layout.Header}
      className={styles.header}
    >
      <Button
        type="text"
        shape="circle"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        onClick={onCollapse}
      />
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: [
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "退出登录",
            },
          ],
          onClick: () => {
            localStorage.removeItem("token");
            navigate({ to: "/login", replace: true });
          },
        }}
      >
        <Button type="text">
          <Flex gap={8} align="center">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>管理员</span>
          </Flex>
        </Button>
      </Dropdown>
    </Flex>
  );
};
