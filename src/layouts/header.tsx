import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Button, Dropdown, Flex } from "antd";
import styles from "./header.module.less";

export default () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate({ to: "/login", replace: true });
  };

  return (
    <Flex
      align="center"
      component="header"
      justify="space-between"
      className={styles.header}
    >
      <Flex align="center" className={styles.left}>
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          className={styles.logo}
        />
      </Flex>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: [
            { key: "logout", icon: <LogoutOutlined />, label: "退出登录" },
          ],
          onClick: handleLogout,
        }}
      >
        <Button variant="text" color="primary" icon={<UserOutlined />} className={styles.user}>
          管理员
        </Button>
      </Dropdown>
    </Flex>
  );
};
