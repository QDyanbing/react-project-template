import { setModify } from '@/services/user';
import { onHistoryBack } from '@/utils/history';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import usePage from '../models/usePage';

export default () => {
  const getPage = usePage.getState;

  const { t } = useTranslation('userSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModify, { manual: true });

  const onModify = async (data: API.UserSetParams) => {
    const { userId } = getPage();
    if (!userId) return;

    const result = await runAsync(userId, data);
    if (!result) return;

    message.success(t('message.modifySuccess'));
    onHistoryBack('/users');
  };

  return { loading, onModify };
};
