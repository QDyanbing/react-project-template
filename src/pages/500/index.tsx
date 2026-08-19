import { onHistoryChange } from '@/utils/history';
import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation('internalServerError');

  return (
    <Result
      status="500"
      title={t('title')}
      subTitle={t('description')}
      extra={
        <Button type="primary" onClick={() => onHistoryChange('/')}>
          {t('backHome')}
        </Button>
      }
    />
  );
};
