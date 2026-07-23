import {
  CodeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Badge,
  BorderBeam,
  Button,
  Card,
  Flex,
  Form,
  Input,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";

import loginHero from "@/assets/login-hero-v2.png";
import styles from "./index.module.less";
import useLogin from "./hooks/useLogin";

const technologies = [
  { color: "blue", label: "React 19" },
  { color: "geekblue", label: "TypeScript" },
  { color: "cyan", label: "Vite" },
  { color: "purple", label: "Ant Design" },
];

export default () => {
  const { token } = theme.useToken();
  const { loading, onLogin } = useLogin();

  return (
    <main className={styles.page}>
      <section className={styles.introduction}>
        <Flex align="center" gap={12} className={styles.brand}>
          <Avatar size="large" shape="square" icon={<CodeOutlined />} />
          <Typography.Text strong className={styles.brandText}>
            React 项目模板
          </Typography.Text>
        </Flex>
        <div className={styles.introductionContent}>
          <Typography.Title className={styles.title}>
            从清晰的工程结构开始
          </Typography.Title>
          <Typography.Paragraph className={styles.description}>
            提供路由、状态管理、请求封装、模拟接口和常用页面的基础实现。
          </Typography.Paragraph>

          <Alert
            showIcon
            type="info"
            variant="filled"
            title="登录成功后自动保存访问令牌，并由请求层统一携带。"
            className={styles.feature}
          />

          <Space wrap size={[8, 8]} className={styles.technologies}>
            {technologies.map(({ color, label }) => (
              <Tag variant="solid" key={label} color={color}>
                {label}
              </Tag>
            ))}
          </Space>
        </div>
        <img alt="" src={loginHero} className={styles.illustration} />
      </section>

      <section className={styles.loginArea}>
        <BorderBeam
          size={180}
          color={[
            { color: token.colorPrimary, percent: 0 },
            { color: token.colorSuccess, percent: 33 },
            { color: token.colorWarning, percent: 66 },
            { color: token.colorError, percent: 100 },
          ]}
        >
          <Card className={styles.card}>
            <Flex vertical gap={24}>
              <Flex vertical gap={4} component="header">
                <Badge text="安全访问" status="processing" />
                <Typography.Title level={2} className={styles.heading}>
                  欢迎登录
                </Typography.Title>
                <Typography.Text type="secondary">
                  请输入账号和密码进入项目。
                </Typography.Text>
              </Flex>

              <Form<API.LoginParams>
                layout="vertical"
                requiredMark={false}
                initialValues={{ account: "admin", password: "123456" }}
                onFinish={onLogin}
              >
                <Form.Item
                  label="账号"
                  name="account"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "请输入账号",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    autoComplete="username"
                    prefix={<UserOutlined />}
                    placeholder="请输入账号"
                  />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password
                    size="large"
                    autoComplete="current-password"
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                </Form.Item>
                <Button
                  block
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  登录
                </Button>
              </Form>

              <Flex justify="center">
                <Typography.Text type="secondary">
                  演示账号：admin / 123456
                </Typography.Text>
              </Flex>
            </Flex>
          </Card>
        </BorderBeam>
      </section>
    </main>
  );
};
