import i18n from '@/i18n';

export const DEFAULT_PAGE_SIZE = 10;

export const showTotal = (total: number) =>
  i18n.t('pagination.total', { ns: 'common', count: total });
