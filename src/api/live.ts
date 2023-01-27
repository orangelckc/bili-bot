import { Body } from "@tauri-apps/api/http";
import { getQueryData } from ".";
import { getStore } from "@/store";
import { LIVE_URL_PREFIX, LOGIN_INFO } from "@/constants";
import type { SendMessage } from "@/types";

// 获取直播分类
const getLiveCategoryApi = async () =>
  await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/web-interface/v1/index/getWebAreaList`,
    {
      query: { source_id: "2" }
    }
  );

// 获取当前直播状态
const getLiveStatusApi = async (room_ids: string) =>
  await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/web-room/v1/index/getRoomBaseInfo`,
    {
      query: { room_ids, req_biz: "link-center" }
    }
  );

// 获取身份码
const getLiveCodeApi = async () =>
  await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/open-platform/v1/common/operationOnBroadcastCode`,
    {
      method: "POST",
      body: Body.form({
        action: "1",
        csrf_token: await getStore(LOGIN_INFO.csrf),
        csrf: await getStore(LOGIN_INFO.csrf)
      }),
      headers: { cookie: await getStore(LOGIN_INFO.cookie) }
    }
  );


// 获取礼物列表
const getGiftApi = async () => {
  const result = await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/web-room/v1/giftPanel/giftConfig`,
    {
      query: {
        platform: "pc",
        room_id: "",
        area_parent_id: 11,
        area_id: 372
      }
    }
  );

  if (result) {
    const styleElement = document.createElement("style");
    // 礼物列表
    const giftList = result.data.list.map(
      ({ id, gif }: any) => `.gift-${id} { background-image: url(${gif}) } `
    );
    // 背景图片列表
    const backgroundImageList = result.data.combo_resources.map(
      ({ img_four }: any, index: number) =>
        `.background-image-${index} { background-image: url(${img_four}) } `
    );

    styleElement.innerHTML = [...giftList, ...backgroundImageList].join("");

    document.head.appendChild(styleElement);

    return backgroundImageList.length;
  }
};

// 获取表情列表
const getEmojiApi = async (roomid: string) =>
  await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/web-ucenter/v2/emoticon/GetEmoticons`,
    {
      query: {
        platform: "pc",
        room_id: roomid
      },
      headers: {
        cookie: await getStore(LOGIN_INFO.cookie)
      },
      hideLoadingBar: true
    }
  );

// 发送消息
const sendMessageApi = async (message: SendMessage) => {

  const cookie = await getStore(LOGIN_INFO.cookie);
  const csrf = await getStore(LOGIN_INFO.csrf);

  return await getQueryData(`${LIVE_URL_PREFIX}/msg/send`, {
    method: "POST",
    body: Body.form({
      ...message,
      isInitiative: "",
      bubble: "0",
      color: "16777215",
      mode: "1",
      fontsize: "25",
      rnd: Math.floor(Date.now() / 1000).toString(),
      csrf,
      csrf_token: csrf
    }),
    headers: {
      cookie
    },
    hideLoadingBar: true
  });
};

// 获取直播视频流 flv格式，弃用
const getLiveFlvUrlApi = async (qn: string = "0", roomid: string) =>
  await getQueryData(`${LIVE_URL_PREFIX}/room/v1/Room/playUrl`, {
    query: {
      cid: roomid,
      qn,
      platform: "web"
    }
  });

// 获取直播视频流 m3u8格式
const getLiveM3U8UrlApi = async (qn: string = "0", roomid: string) =>
  await getQueryData(`${LIVE_URL_PREFIX}/xlive/web-room/v2/index/getRoomPlayInfo`, {
    query: {
      device: "pc",
      platform: "web",
      scale: "3",
      qn: qn,
      protocol: "0,1",
      format: "0,1,2",
      codec: "0,1",
      room_id: roomid
    }
  })


// 获取关注的主播列表
const getMyFollowLiveInfo = async (page: string = "1") =>
  await getQueryData(
    `${LIVE_URL_PREFIX}/xlive/web-ucenter/v1/xfetter/GetWebList`,
    {
      query: {
        page,
        page_size: "10"
      },
      headers: {
        cookie: await getStore(LOGIN_INFO.cookie)
      }
    }
  );

export {
  getLiveCategoryApi,
  getLiveStatusApi,
  getLiveCodeApi,
  getGiftApi,
  getEmojiApi,
  sendMessageApi,
  getLiveFlvUrlApi,
  getLiveM3U8UrlApi,
  getMyFollowLiveInfo
};
