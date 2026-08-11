import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { setDelete } from '@/services/user';
import useData from '../models/useData';

export default () => {
  const { onRefresh } = useData.getState();

  const { t } = useTranslation('user');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setDelete, { manual: true });

  const onDelete = async (uuid: string) => {
    const result = await runAsync(uuid);
    if (!result) return;

    message.success(t('message.deleteSuccess'));
    onRefresh();
  };

  return { loading, onDelete };
};
