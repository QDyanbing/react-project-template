import PasswordView from '@/components/PasswordView';
import useUrlState from '@/hooks/useUrlState';
import { onHistoryBack } from '@/utils/history';
import { Button, Flex, Form, Input, Select, Spin } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useCreate from './hooks/useCreate';
import useModify from './hooks/useModify';
import styles from './index.module.less';
import useDetail from './models/useDetail';
import usePage from './models/usePage';
import usePassword from './models/usePassword';
import useRoleOptions from './models/useRoleOptions';

export default () => {
  const { mount, unmount } = usePage();
  const { loading: detailLoading, data } = useDetail();
  const { loading: roleLoading, data: roles } = useRoleOptions();
  const { password, onClose: onPasswordClose } = usePassword();

  const { loading: createLoading, onCreate } = useCreate();
  const { loading: modifyLoading, onModify } = useModify();

  const [{ userId }] = useUrlState<{ userId?: string }>();
  const [form] = Form.useForm<API.UserSetParams>();

  const { t } = useTranslation('userSet');

  const onFinish = async (values: API.UserSetParams) => {
    if (userId) {
      await onModify(values);
    } else {
      await onCreate(values);
    }
  };

  const onPasswordViewClose = () => {
    onPasswordClose();
    onHistoryBack('/users');
  };

  useEffect(() => {
    mount(userId);

    return () => {
      unmount();
      onPasswordClose();
    };
  }, [mount, onPasswordClose, unmount, userId]);

  useEffect(() => {
    if (data) {
      const { name, email, phone, roles } = data;
      const roleUuids = roles.map(({ uuid: roleUuid }) => roleUuid);
      form.setFieldsValue({ name, email, phone, roleUuids });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  return (
    <Spin
      spinning={detailLoading || roleLoading || createLoading || modifyLoading}
      classNames={{ root: styles.userSet, container: styles.container }}
    >
      <Form
        form={form}
        initialValues={{ roleUuids: [] }}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        className={styles.body}
        onFinish={onFinish}
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
        <Form.Item
          name="phone"
          label={t('phone')}
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: t('phoneInvalid') }]}
        >
          <Input placeholder={t('phonePlaceholder')} />
        </Form.Item>
        <Form.Item
          name="roleUuids"
          label={t('roles')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Select
            mode="multiple"
            fieldNames={{ label: 'name', value: 'uuid' }}
            options={roles}
            placeholder={t('rolesPlaceholder')}
          />
        </Form.Item>
      </Form>
      <Flex gap="medium" justify="flex-end" className={styles.footer}>
        <Button onClick={() => onHistoryBack('/users')}>{t('cancel')}</Button>
        <Button type="primary" onClick={form.submit}>
          {t('save')}
        </Button>
      </Flex>
      <PasswordView
        description={t('passwordView.description')}
        password={password}
        open={Boolean(password)}
        onClose={onPasswordViewClose}
      />
    </Spin>
  );
};
