import { App } from 'antd';
import { useRequest } from 'ahooks';

import { setModify } from '@/services/home';
import onBack from '@/utils/onBack';
import usePage from '../models/usePage';

export default () => {
  const { message } = App.useApp();
  const { loading, runAsync } = useRequest(setModify, { manual: true });

  const onModify = async (data: API.HomeSetParams) => {
    const { uuid } = usePage.getState();
    if (!uuid) return;

    const result = await runAsync(uuid, data);
    if (!result) return;

    message.success('项目修改成功');
    onBack('/home');
  };

  return { loading, onModify };
};
