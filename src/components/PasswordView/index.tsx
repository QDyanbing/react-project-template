import { Alert, Descriptions, Drawer, Flex, Result, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  description: string;
  password?: string;
  open: boolean;
  onClose: () => void;
}

export default ({ description, password, open, onClose }: Props) => {
  const { t } = useTranslation('passwordView');

  const items = password
    ? [
        {
          key: 'password',
          label: t('password'),
          children: (
            <Typography.Text
              code
              strong
              copyable={{
                text: password,
                tooltips: [t('copy'), t('copied')],
              }}
            >
              {password}
            </Typography.Text>
          ),
        },
      ]
    : [];

  return (
    <Drawer
      destroyOnHidden
      size="large"
      keyboard={false}
      closable={{ placement: 'end' }}
      mask={{ closable: false }}
      open={open}
      title={t('title')}
      onClose={onClose}
    >
      <Flex vertical gap="large">
        <Result status="success" subTitle={description} />
        <Alert showIcon type="warning" title={t('warning')} />
        <Descriptions bordered column={1} items={items} />
      </Flex>
    </Drawer>
  );
};
