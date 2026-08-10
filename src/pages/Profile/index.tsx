import { Spin, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import useCurrentUser from '@/models/useCurrentUser';
import Overview from './components/Overview';
import PasswordForm from './components/PasswordForm';
import ProfileForm from './components/ProfileForm';
import styles from './index.module.less';

export default () => {
  const { loading } = useCurrentUser();

  const { t } = useTranslation('profile');

  const items = [
    { key: 'overview', label: t('overview'), children: <Overview /> },
    { key: 'profile', label: t('modifyProfile'), children: <ProfileForm /> },
    { key: 'password', label: t('passwordSecurity'), children: <PasswordForm /> },
  ];

  return (
    <Spin spinning={loading} classNames={{ root: styles.profile, container: styles.container }}>
      <Tabs items={items} />
    </Spin>
  );
};
