import { useRequest } from 'ahooks';

import useCurrentUser from '@/models/useCurrentUser';
import { setLogout } from '@/services/account';
import { onHistoryReplace } from '@/utils/history';
import { deleteToken } from '@/utils/token';

export default () => {
  const { unmount } = useCurrentUser.getState();

  const { loading, runAsync } = useRequest(setLogout, { manual: true });

  const onLogout = async () => {
    const result = await runAsync();
    if (!result) return;

    deleteToken();
    unmount();
    onHistoryReplace('/login');
  };

  return { loading, onLogout };
};
