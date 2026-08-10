import { Tooltip } from 'antd';
import { cloneElement, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import { hasPermission } from '@/utils/access';

interface Props {
  children: ReactElement<{ disabled?: boolean }>;
  permissions: string | string[];
}

export default ({ children, permissions }: Props) => {
  const { data } = useCurrentUser();

  const { t } = useTranslation('permission');

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  const disabled = !hasPermission(data?.permissions ?? [], requiredPermissions);

  if (!disabled) return children;

  return <Tooltip title={t('denied')}>{cloneElement(children, { disabled })}</Tooltip>;
};
