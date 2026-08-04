import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { setCreate } from '@/services/home';
import { onHistoryBack } from '@/utils/history';

export default () => {
  const { t } = useTranslation('homeSet');
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setCreate, { manual: true });

  const onCreate = async (data: API.HomeSetParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success(t('createSuccess'));
    onHistoryBack('/home');
  };

  return { loading, onCreate };
};
