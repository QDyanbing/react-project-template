import dayjs from 'dayjs';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_FORMAT = 'YYYY-MM-DD';

/** 将时间格式化为 `YYYY-MM-DD HH:mm:ss`。 */
export const formatTime = (value: dayjs.ConfigType) => {
  const date = dayjs(value);

  return date.isValid() ? date.format(DATE_TIME_FORMAT) : '';
};

/** 将日期格式化为 `YYYY-MM-DD`。 */
export const formatDate = (value: dayjs.ConfigType) => {
  const date = dayjs(value);

  return date.isValid() ? date.format(DATE_FORMAT) : '';
};
