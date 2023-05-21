import { Body } from "@tauri-apps/api/http";
import { getQueryData } from ".";
import { getStore } from "@/store";
import { LOGIN_URL_PREFIX, LOGIN_INFO, BASE_URL_PREFIX } from "@/constants";
import { isLogin } from "@/utils/auth";

// 获取登录url
const getLoginUrlApi = async () =>
  await getQueryData(`${LOGIN_URL_PREFIX}/qrcode/getLoginUrl`, {
    returnError: true
  });

// 验证二维码是否被扫描
const verifyQrCodeApi = async (oauthKey: string) =>
  await getQueryData(`${LOGIN_URL_PREFIX}/qrcode/getLoginInfo`, {
    method: "POST",
    body: Body.form({
      oauthKey,
      gourl: "https://www.bilibili.com/"
    }),
    returnError: true
  });

// 验证登录信息是否有效
const validateLoginInfoApi = async () =>
  await getQueryData(
    "https://api.vc.bilibili.com/link_setting/v1/link_setting/get",
    {
      method: "POST",
      body: Body.form({
        msg_notify: "1",
        show_unfollowed_msg: "1",
        build: "0",
        mobi_app: "web",
        csrf_token: await getStore(LOGIN_INFO.csrf),
        csrf: await getStore(LOGIN_INFO.csrf)
      }),
      headers: {
        cookie: await getStore(LOGIN_INFO.cookie)
      },
      returnError: true
    }
  );

// 获取用户信息
const getUserInfoApi = async () =>
  await getQueryData(`${BASE_URL_PREFIX}/x/space/wbi/acc/info`, {
    query: { mid: (await getStore(LOGIN_INFO.uid)) }
  });

export {
  getLoginUrlApi,
  verifyQrCodeApi,
  validateLoginInfoApi,
  getUserInfoApi
};
