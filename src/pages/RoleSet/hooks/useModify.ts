import { setModify } from '@/services/role';
import { onHistoryBack } from '@/utils/history';
import { useRequest } from 'ahooks';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import usePage from '../models/usePage';

export default () => {
  const getPage = usePage.getState;

  const { t } = useTranslation('roleSet');

  const { message } = App.useApp();

  const { loading, runAsync } = useRequest(setModify, { manual: true });

  const onModify = async (data: API.RoleSetParams) => {
    const { uuid } = getPage();
    if (!uuid) return;

    const result = await runAsync(uuid, data);
    if (!result) return;

    message.success(t('message.modifySuccess'));
    onHistoryBack('/roles');
  };

  return { loading, onModify };
};
