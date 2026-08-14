import PasswordView from '@/components/PasswordView';
import Permission from '@/components/Permission';
import { formatTime } from '@/utils/format';
import { onHistoryChange } from '@/utils/history';
import { Button, Pagination, Popconfirm, Space, Spin, Table, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import SearchBar from './components/SearchBar';
import useDelete from './hooks/useDelete';
import useDisable from './hooks/useDisable';
import useEnable from './hooks/useEnable';
import useResetPassword from './hooks/useResetPassword';
import styles from './index.module.less';
import useData from './models/useData';
import usePage from './models/usePage';
import usePassword from './models/usePassword';

export default () => {
  const { mount, unmount, params, onPaginationChange } = usePage();
  const { loading, data, total } = useData();
  const { password, onClose: onPasswordClose } = usePassword();

  const { loading: deleteLoading, onDelete } = useDelete();
  const { loading: disableLoading, onDisable } = useDisable();
  const { loading: enableLoading, onEnable } = useEnable();
  const { loading: passwordLoading, onResetPassword } = useResetPassword();

  const { t } = useTranslation('user');

  const columns = [
    { title: t('column.account'), dataIndex: 'account' },
    { title: t('column.name'), dataIndex: 'name' },
    {
      title: t('column.roles'),
      dataIndex: 'roles',
      render: (roles: API.Role[]) => (
        <Space wrap size="small">
          {roles.map((role) => (
            <Tag key={role.uuid}>{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      width: 100,
      title: t('column.status'),
      dataIndex: 'status',
      render: (status: API.User['status']) => (
        <Tag color={status === 'enabled' ? 'success' : 'default'}>{t(`status.${status}`)}</Tag>
      ),
    },
    {
      width: 180,
      title: t('column.gmtCreate'),
      dataIndex: 'gmtCreate',
      render: formatTime,
    },
    {
      width: 380,
      title: t('column.action'),
      dataIndex: 'userId',
      render: (userId: string, user: API.User) => (
        <Space size="small">
          <Button
            type="link"
            className={styles.action}
            onClick={() => onHistoryChange('/users/detail', { userId })}
          >
            {t('action.detail')}
          </Button>
          <Permission permissions="user:modify">
            <Button
              type="link"
              className={styles.action}
              onClick={() => onHistoryChange('/users/modify', { userId })}
            >
              {t('action.modify')}
            </Button>
          </Permission>
          {user.status === 'enabled' ? (
            <Popconfirm title={t('action.disableConfirm')} onConfirm={() => onDisable(userId)}>
              <Permission permissions="user:disable">
                <Button type="link" className={styles.action}>
                  {t('action.disable')}
                </Button>
              </Permission>
            </Popconfirm>
          ) : (
            <Popconfirm title={t('action.enableConfirm')} onConfirm={() => onEnable(userId)}>
              <Permission permissions="user:enable">
                <Button type="link" className={styles.action}>
                  {t('action.enable')}
                </Button>
              </Permission>
            </Popconfirm>
          )}
          <Popconfirm
            title={t('action.resetPasswordConfirm')}
            onConfirm={() => onResetPassword(userId)}
          >
            <Permission permissions="user:reset-password">
              <Button type="link" className={styles.action}>
                {t('action.resetPassword')}
              </Button>
            </Permission>
          </Popconfirm>
          <Popconfirm title={t('action.deleteConfirm')} onConfirm={() => onDelete(userId)}>
            <Permission permissions="user:delete">
              <Button danger type="link" className={styles.action}>
                {t('action.delete')}
              </Button>
            </Permission>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    mount();

    return () => {
      unmount();
      onPasswordClose();
    };
  }, [mount, onPasswordClose, unmount]);

  return (
    <Spin
      spinning={loading || deleteLoading || disableLoading || enableLoading || passwordLoading}
      classNames={{ root: styles.user, container: styles.container }}
    >
      <SearchBar />
      <Table
        sticky
        pagination={false}
        rowKey="userId"
        columns={columns}
        dataSource={data}
        className={styles.body}
      />
      <Pagination
        showSizeChanger
        align="end"
        current={params.pageNum}
        disabled={loading}
        pageSize={params.pageSize}
        total={total}
        className={styles.footer}
        showTotal={(value) => (
          <Trans
            i18nKey="pagination.total"
            t={t}
            values={{ count: value }}
            components={{ count: <Typography.Text strong type="success" /> }}
          />
        )}
        onChange={onPaginationChange}
      />
      <PasswordView
        description={t('passwordView.description')}
        password={password}
        open={Boolean(password)}
        onClose={onPasswordClose}
      />
    </Spin>
  );
};
