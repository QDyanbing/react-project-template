import { setCreate } from '@/services/user';
import { useRequest } from 'ahooks';
import usePassword from '../models/usePassword';

export default () => {
  const onOpenPassword = usePassword.getState().onOpen;

  const { loading, runAsync } = useRequest(setCreate, { manual: true });

  const onCreate = async (data: API.UserSetParams) => {
    const result = await runAsync(data);
    if (!result) return;

    onOpenPassword(result.data.password);
  };

  return { loading, onCreate };
};
