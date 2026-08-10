import { Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import useModifyProfile from '../../hooks/useModifyProfile';

export default () => {
  const { data } = useCurrentUser();

  const { loading, onModifyProfile } = useModifyProfile();

  const [form] = Form.useForm<API.AccountProfileParams>();

  const { t } = useTranslation('profile');

  useEffect(() => {
    if (!data) return;

    const { name, email, phone } = data;
    form.setFieldsValue({ name, email, phone });
  }, [data, form]);

  return (
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} onFinish={onModifyProfile}>
      <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('required') }]}>
        <Input placeholder={t('namePlaceholder')} />
      </Form.Item>
      <Form.Item
        name="email"
        label={t('email')}
        rules={[{ type: 'email', message: t('emailInvalid') }]}
      >
        <Input placeholder={t('emailPlaceholder')} />
      </Form.Item>
      <Form.Item name="phone" label={t('phone')}>
        <Input placeholder={t('phonePlaceholder')} />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('save')}
        </Button>
      </Form.Item>
    </Form>
  );
};
