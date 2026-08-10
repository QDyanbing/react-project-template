import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import { setModifyProfile } from '@/services/account';

export default () => {
  const { onRefresh } = useCurrentUser.getState();

  const { t } = useTranslation('profile');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModifyProfile, { manual: true });

  const onModifyProfile = async (data: API.AccountProfileParams) => {
    const result = await runAsync(data);
    if (!result) return;

    await onRefresh();
    message.success(t('message.profileSuccess'));
  };

  return { loading, onModifyProfile };
};
