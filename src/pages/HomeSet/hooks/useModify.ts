import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { setModify } from '@/services/home';
import { onHistoryBack } from '@/utils/history';
import usePage from '../models/usePage';

export default () => {
  const { t } = useTranslation('homeSet');
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setModify, { manual: true });

  const onModify = async (data: API.HomeSetParams) => {
    const { uuid } = usePage.getState();
    if (!uuid) return;

    const result = await runAsync(uuid, data);
    if (!result) return;

    message.success(t('modifySuccess'));
    onHistoryBack('/home');
  };

  return { loading, onModify };
};
