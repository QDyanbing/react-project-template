import { Tooltip } from 'antd';
import { cloneElement, type DOMAttributes, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import { hasPermission } from '@/utils/access';

interface ChildProps extends Omit<DOMAttributes<HTMLElement>, 'children'> {
  className?: string;
  disabled?: boolean;
}

interface Props extends Omit<ChildProps, 'disabled'> {
  permissions: string | string[];
  children: ReactElement<ChildProps>;
}

export default ({ permissions, children, className, ...props }: Props) => {
  const { data } = useCurrentUser();

  const { t } = useTranslation('permission');

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  const disabled = !hasPermission(data?.permissions ?? [], requiredPermissions);
  const childClassName =
    [children.props.className, className].filter(Boolean).join(' ') || undefined;
  const child = cloneElement(
    children,
    disabled
      ? { ...props, className: childClassName, disabled }
      : { ...props, className: childClassName },
  );

  if (!disabled) return child;

  return <Tooltip title={t('denied')}>{child}</Tooltip>;
};
