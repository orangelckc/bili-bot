export const LOGIN_INFO = {
  uid: "login_info.uid",
  cookie: "login_info.cookie",
  csrf: "login_info.csrf",
  avatar: "login_info.avatar",
  uname: "login_info.uname"
};

export const MANAGE = {
  roomid: 'manage.roomid',
  hostName: 'manage.hostName',
  robotName: 'manage.robotName',
  like: 'manage.like',
  follow: 'manage.follow',
  gift: 'manage.gift',
  welcome: 'manage.welcome',
  gptToken: 'manage.gptToken'
};

export const MESSAGE_TYPE = {
  RANK: "ONLINE_RANK_V2",
  DANMU: "DANMU_MSG",
  GIFT: "SEND_GIFT" || "COMBO_SEND",
  INTERACT: "INTERACT_WORD",
  ENTRY: "ENTRY_EFFECT",
  GUARD_ENTRY: "WELCOME_GUARD",
  TOP3: "ONLINE_RANK_TOP3",
  SUPERCHAT: "SUPER_CHAT_MESSAGE",
  ROOMCHANGE: "ROOM_CHANGE",
  LIVESTART: "LIVE",
  LIVECLOSE: "PREPARING",
  REDPACKET: "POPULARITY_RED_POCKET_NEW",
  WATCHCHANGE: "WATCHED_CHANGE",
  GUARDBUY: "GUARD_BUY",
  LIKE: "LIKE_INFO_V3_CLICK",
  LIVEGAME: "LIVE_INTERACTIVE_GAME",
  NOTICE_MSG: "USER_TOAST_MSG" || "NOTICE_MSG"
};


export * from "./url";
export * from "./events";
export * from "./store";
