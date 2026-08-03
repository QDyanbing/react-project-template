import useUrlState from '@/hooks/useUrlState';
import onBack from '@/utils/onBack';
import { Button, Flex, Form, Input, Spin } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useCreate from './hooks/useCreate';
import useModify from './hooks/useModify';
import styles from './index.module.less';
import useDetail from './models/useDetail';
import usePage from './models/usePage';

export default () => {
  const { t } = useTranslation('homeSet');
  const { mount, unmount } = usePage();
  const { loading, data } = useDetail();

  const { loading: createLoading, onCreate } = useCreate();
  const { loading: modifyLoading, onModify } = useModify();

  const [{ uuid }] = useUrlState<{ uuid?: string }>();
  const [form] = Form.useForm<API.HomeSetParams>();

  const onFinish = async (data: API.HomeSetParams) => {
    if (uuid) {
      await onModify(data);
    } else {
      await onCreate(data);
    }
  };

  useEffect(() => {
    mount(uuid);

    return unmount;
  }, [mount, unmount, uuid]);

  useEffect(() => {
    if (data) {
      const { name, description } = data;
      form.setFieldsValue({ name, description });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  return (
    <Spin
      spinning={loading || createLoading || modifyLoading}
      classNames={{ root: styles.homeSet, container: styles.container }}
    >
      <Flex vertical flex={1} className={styles.body}>
        <Form layout="vertical" form={form} className={styles.content} onFinish={onFinish}>
          <Form.Item
            name="name"
            label={t('name.label')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('name.required'),
              },
              { max: 100, message: t('name.max', { count: 100 }) },
            ]}
          >
            <Input placeholder={t('name.placeholder')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('description.label')}
            rules={[{ max: 500, message: t('description.max', { count: 500 }) }]}
          >
            <Input.TextArea
              showCount
              placeholder={t('description.placeholder')}
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Flex>
      <Flex gap="medium" justify="flex-end" className={styles.footer}>
        <Button onClick={() => onBack('/home')}>{t('cancel')}</Button>
        <Button type="primary" onClick={() => form.submit()}>
          {t('save')}
        </Button>
      </Flex>
    </Spin>
  );
};
