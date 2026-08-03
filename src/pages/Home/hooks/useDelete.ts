import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { setDelete } from '@/services/home';
import useData from '../models/useData';

export default () => {
  const { t } = useTranslation('home');
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setDelete, { manual: true });

  const onDelete = async (uuid: string) => {
    const result = await runAsync(uuid);
    if (!result) return;

    message.success(t('actions.deleteSuccess'));
    useData.getState().onRefresh();
  };

  return {
    loading,
    onDelete,
  };
};
