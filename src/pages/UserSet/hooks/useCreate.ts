import { setCreate } from '@/services/user';
import { onHistoryBack } from '@/utils/history';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation('userSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setCreate, { manual: true });

  const onCreate = async (data: API.UserSetParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success(t('message.createSuccess', { password: result.data.password }));
    onHistoryBack('/users');
  };

  return { loading, onCreate };
};
