import { useNavigate } from '@tanstack/react-router';
import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation('notFound');
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title={t('title')}
      subTitle={t('description')}
      extra={
        <Button type="primary" onClick={() => navigate({ to: '/' })}>
          {t('backHome')}
        </Button>
      }
    />
  );
};
