import { deleteStorage, getStorage, setStorage } from '@/utils/storage';

const TOKEN_KEY = 'token';

/** 保存当前登录凭证。 */
export const setToken = (token: string) => setStorage(TOKEN_KEY, token);

/** 获取当前登录凭证。 */
export const getToken = () => getStorage(TOKEN_KEY);

/** 删除当前登录凭证。 */
export const deleteToken = () => deleteStorage(TOKEN_KEY);
