import { useRequest } from 'ahooks';

import useUrlState from '@/hooks/useUrlState';
import { setLogin } from '@/services/account';

export default () => {
  const [{ redirect }] = useUrlState<{ redirect?: string }>();
  const { loading, runAsync } = useRequest(setLogin, { manual: true });

  const onLogin = async (params: API.LoginParams) => {
    const result = await runAsync(params);
    if (!result) return;

    localStorage.setItem('token', result.data.token);
    location.replace(redirect || '/');
  };

  return {
    loading,
    onLogin,
  };
};
