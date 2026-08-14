import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { setResetPassword } from '@/services/user';

export default () => {
  const { t } = useTranslation('user');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setResetPassword, { manual: true });

  const onResetPassword = async (userId: string) => {
    const result = await runAsync(userId);
    if (!result) return;

    message.success(t('message.resetPasswordSuccess', { password: result.data.password }));
  };

  return { loading, onResetPassword };
};
