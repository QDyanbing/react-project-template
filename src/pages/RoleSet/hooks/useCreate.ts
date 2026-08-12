import { setCreate } from '@/services/role';
import { onHistoryBack } from '@/utils/history';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation('roleSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setCreate, { manual: true });

  const onCreate = async (data: API.RoleSetParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success(t('message.createSuccess'));
    onHistoryBack('/roles');
  };

  return { loading, onCreate };
};
