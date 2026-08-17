import useCurrentUser from '@/models/useCurrentUser';
import { onHistoryBack } from '@/utils/history';
import { Button, Flex, Form, Input, Spin, Typography } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useModify from './hooks/useModify';
import styles from './index.module.less';

export default () => {
  const { loading: dataLoading, data } = useCurrentUser();

  const { loading: modifyLoading, onModify } = useModify();

  const [form] = Form.useForm<API.AccountProfileParams>();

  const { t } = useTranslation('profileSet');

  useEffect(() => {
    if (!data) return;

    form.setFieldsValue(data);
  }, [data, form]);

  return (
    <Spin
      spinning={dataLoading || modifyLoading}
      classNames={{ root: styles.profileSet, container: styles.container }}
    >
      {data && (
        <>
          <Typography.Title level={4} className={styles.header}>
            {t('title')}
          </Typography.Title>
          <Form
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            className={styles.body}
            onFinish={onModify}
          >
            <Form.Item
              name="name"
              label={t('name')}
              rules={[{ required: true, whitespace: true, message: t('required') }]}
            >
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
          </Form>
          <Flex gap="medium" justify="flex-end" className={styles.footer}>
            <Button onClick={() => onHistoryBack('/profile')}>{t('cancel')}</Button>
            <Button type="primary" onClick={form.submit}>
              {t('save')}
            </Button>
          </Flex>
        </>
      )}
    </Spin>
  );
};
