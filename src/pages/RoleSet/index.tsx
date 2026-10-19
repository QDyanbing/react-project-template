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
import usePermissionOptions from './models/usePermissionOptions';

interface FormValues extends Omit<API.RoleSetParams, 'permissionCodes'> {
  permissions: { value: string; label: string }[];
}

export default () => {
  const { mount, unmount } = usePage();
  const { loading: detailLoading, data } = useDetail();
  const { loading: permissionLoading, data: permissions } = usePermissionOptions();

  const { loading: createLoading, onCreate } = useCreate();
  const { loading: modifyLoading, onModify } = useModify();

  const [{ uuid }] = useUrlState<{ uuid?: string }>();
  const [form] = Form.useForm<FormValues>();

  const { t } = useTranslation('roleSet');

  const onFinish = async (values: FormValues) => {
    const { permissions, ...fields } = values;
    const params = { ...fields, permissionCodes: permissions.map(({ value }) => value) };

    if (uuid) {
      await onModify(params);
    } else {
      await onCreate(params);
    }
  };

  useEffect(() => {
    mount(uuid);

    return unmount;
  }, [mount, unmount, uuid]);

  useEffect(() => {
    if (data) {
      const { name, description, permissions } = data;
      form.setFieldsValue({
        name,
        description,
        permissions: permissions.map(({ code, name }) => ({ value: code, label: name })),
      });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  return (
    <Spin
      spinning={detailLoading || permissionLoading || createLoading || modifyLoading}
      classNames={{ root: styles.roleSet, container: styles.container }}
    >
      <Form
        form={form}
        initialValues={{ permissions: [] }}
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
        <Form.Item name="description" label={t('description')}>
          <Input.TextArea placeholder={t('descriptionPlaceholder')} />
        </Form.Item>
        <Form.Item
          name="permissions"
          label={t('permissions')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Select
            labelInValue
            mode="multiple"
            fieldNames={{ label: 'name', value: 'code' }}
            options={permissions}
            placeholder={t('permissionsPlaceholder')}
          />
        </Form.Item>
      </Form>
      <Flex gap="medium" justify="flex-end" className={styles.footer}>
        <Button onClick={() => onHistoryBack('/roles')}>{t('cancel')}</Button>
        <Button type="primary" onClick={form.submit}>
          {t('save')}
        </Button>
      </Flex>
    </Spin>
  );
};
