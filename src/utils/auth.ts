import { getStore, deleteStore } from "@/store";
import { LOGIN_INFO } from "@/constants";

// 验证登录信息是否存在
const isLogin = async () =>
  (await getStore(LOGIN_INFO.uid)) &&
  (await getStore(LOGIN_INFO.cookie)) &&
  (await getStore(LOGIN_INFO.csrf));


// 清除登陆信息
const clearInfo = () => {
  Object.values(LOGIN_INFO).forEach((key) => {
    deleteStore(key);
  });
};

export { isLogin, clearInfo };
