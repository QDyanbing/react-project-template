import { onHistoryBack } from '@/utils/history';
import { Button, Flex, Form, Input, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import useModify from './hooks/useModify';
import styles from './index.module.less';

interface FormData extends API.AccountPasswordParams {
  confirmPassword: string;
}

export default () => {
  const { loading, onModify } = useModify();

  const [form] = Form.useForm<FormData>();

  const { t } = useTranslation('passwordSet');

  const onFinish = ({ currentPassword, password }: FormData) => {
    onModify({ currentPassword, password });
  };

  return (
    <Spin spinning={loading} classNames={{ root: styles.passwordSet, container: styles.container }}>
      <Typography.Title level={4} className={styles.header}>
        {t('title')}
      </Typography.Title>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        className={styles.body}
        onFinish={onFinish}
      >
        <Form.Item
          name="currentPassword"
          label={t('currentPassword')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('password')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={t('confirmPassword')}
          dependencies={['password']}
          rules={[
            { required: true, message: t('required') },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('password') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('passwordMismatch'))),
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
      <Flex gap="medium" justify="flex-end" className={styles.footer}>
        <Button onClick={() => onHistoryBack('/profile')}>{t('cancel')}</Button>
        <Button type="primary" onClick={form.submit}>
          {t('confirm')}
        </Button>
      </Flex>
    </Spin>
  );
};
