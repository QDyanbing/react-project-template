import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import useModifyPassword from '../../hooks/useModifyPassword';

interface FormData extends API.AccountPasswordParams {
  confirmPassword: string;
}

export default () => {
  const { loading, onModifyPassword } = useModifyPassword();

  const { t } = useTranslation('profile');

  const onFinish = ({ currentPassword, password }: FormData) => {
    onModifyPassword({ currentPassword, password });
  };

  return (
    <Form<FormData> labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} onFinish={onFinish}>
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
      <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('modifyPassword')}
        </Button>
      </Form.Item>
    </Form>
  );
};
