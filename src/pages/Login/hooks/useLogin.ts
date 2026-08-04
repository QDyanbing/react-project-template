import { useRequest } from 'ahooks';

import useUrlState from '@/hooks/useUrlState';
import { setLogin } from '@/services/account';
import { onHistoryReplace } from '@/utils/history';

export default () => {
  const [{ redirect: redirectPath }] = useUrlState<{ redirect?: string }>();
  const { loading, runAsync } = useRequest(setLogin, { manual: true });

  const onLogin = async (params: API.LoginParams) => {
    const result = await runAsync(params);
    if (!result) return;

    localStorage.setItem('token', result.data.token);
    onHistoryReplace(redirectPath || '/');
  };

  return {
    loading,
    onLogin,
  };
};
