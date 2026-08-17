import useCurrentUser from '@/models/useCurrentUser';
import { setModifyProfile } from '@/services/account';
import { onHistoryBack } from '@/utils/history';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { onRefresh } = useCurrentUser.getState();

  const { t } = useTranslation('profileSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModifyProfile, { manual: true });

  const onModify = async (data: API.AccountProfileParams) => {
    const result = await runAsync(data);
    if (!result) return;

    await onRefresh();
    message.success(t('message.modifySuccess'));
    onHistoryBack('/profile');
  };

  return { loading, onModify };
};
