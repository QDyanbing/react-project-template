import { CodeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
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
} from 'antd';
import { useTranslation } from 'react-i18next';

import loginHero from '@/assets/login-hero-v2.png';
import LocaleSwitch from '@/components/LocaleSwitch';
import useLogin from './hooks/useLogin';
import styles from './index.module.less';

const technologies = [
  { color: 'blue', label: 'React 19' },
  { color: 'geekblue', label: 'TypeScript' },
  { color: 'cyan', label: 'Vite' },
  { color: 'purple', label: 'Ant Design' },
];

export default () => {
  const { t } = useTranslation('login');
  const { token } = theme.useToken();
  const { loading, onLogin } = useLogin();

  return (
    <main className={styles.page}>
      <section className={styles.introduction}>
        <Flex align="center" gap={12} className={styles.brand}>
          <Avatar size="large" shape="square" icon={<CodeOutlined />} />
          <Typography.Text strong className={styles.brandText}>
            {t('brand')}
          </Typography.Text>
        </Flex>
        <div className={styles.introductionContent}>
          <Typography.Title className={styles.title}>{t('introduction.title')}</Typography.Title>
          <Typography.Paragraph className={styles.description}>
            {t('introduction.description')}
          </Typography.Paragraph>

          <Alert
            showIcon
            type="info"
            variant="filled"
            title={t('introduction.feature')}
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
                <Flex align="center" justify="space-between">
                  <Badge text={t('form.security')} status="processing" />
                  <LocaleSwitch />
                </Flex>
                <Typography.Title level={2} className={styles.heading}>
                  {t('form.title')}
                </Typography.Title>
                <Typography.Text type="secondary">{t('form.description')}</Typography.Text>
              </Flex>

              <Form<API.LoginParams>
                layout="vertical"
                requiredMark={false}
                initialValues={{ account: 'admin', password: '123456' }}
                onFinish={onLogin}
              >
                <Form.Item
                  label={t('form.account.label')}
                  name="account"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t('form.account.required'),
                    },
                  ]}
                >
                  <Input
                    size="large"
                    autoComplete="username"
                    prefix={<UserOutlined />}
                    placeholder={t('form.account.placeholder')}
                  />
                </Form.Item>
                <Form.Item
                  label={t('form.password.label')}
                  name="password"
                  rules={[{ required: true, message: t('form.password.required') }]}
                >
                  <Input.Password
                    size="large"
                    autoComplete="current-password"
                    prefix={<LockOutlined />}
                    placeholder={t('form.password.placeholder')}
                  />
                </Form.Item>
                <Button block size="large" type="primary" htmlType="submit" loading={loading}>
                  {t('form.submit')}
                </Button>
              </Form>

              <Flex justify="center">
                <Typography.Text type="secondary">{t('form.demo')}</Typography.Text>
              </Flex>
            </Flex>
          </Card>
        </BorderBeam>
      </section>
    </main>
  );
};
