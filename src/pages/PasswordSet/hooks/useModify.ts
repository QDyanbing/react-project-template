import useCurrentUser from '@/models/useCurrentUser';
import { setModifyPassword } from '@/services/account';
import { onHistoryReplace } from '@/utils/history';
import { deleteToken } from '@/utils/token';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

export default () => {
  const { unmount } = useCurrentUser.getState();

  const { t } = useTranslation('passwordSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModifyPassword, { manual: true });

  const onModify = async (data: API.AccountPasswordParams) => {
    const result = await runAsync(data);
    if (!result) return;

    message.success(t('message.modifySuccess'));
    deleteToken();
    unmount();
    onHistoryReplace('/login');
  };

  return { loading, onModify };
};
