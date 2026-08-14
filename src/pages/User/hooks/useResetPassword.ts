import { setResetPassword } from '@/services/user';
import { useRequest } from 'ahooks';
import usePassword from '../models/usePassword';

export default () => {
  const onOpenPassword = usePassword.getState().onOpen;

  const { loading, runAsync } = useRequest(setResetPassword, { manual: true });

  const onResetPassword = async (userId: string) => {
    const result = await runAsync(userId);
    if (!result) return;

    onOpenPassword(result.data.password);
  };

  return { loading, onResetPassword };
};
