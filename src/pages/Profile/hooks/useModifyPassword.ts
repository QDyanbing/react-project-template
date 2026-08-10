import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import { setModifyPassword } from '@/services/account';
import { onHistoryReplace } from '@/utils/history';
import { deleteToken } from '@/utils/token';

export default () => {
  const { unmount } = useCurrentUser.getState();

  const { t } = useTranslation('profile');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModifyPassword, { manual: true });

  const onModifyPassword = async (data: API.AccountPasswordParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success(t('message.passwordSuccess'));
    deleteToken();
    unmount();
    onHistoryReplace('/login');
  };

  return { loading, onModifyPassword };
};
