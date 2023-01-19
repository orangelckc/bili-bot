import { nanoid } from "nanoid";
import { emit } from "@tauri-apps/api/event";
import { LIVE_END_EVENT, LIVE_START_EVENT, MESSAGE_TYPE, LOGIN_INFO, WATCHED_CHANGE_EVENT } from "@/constants";
import { getStore } from "@/store";
import { colorHexToRgba } from "@/utils/socket";

// 格式化弹幕信息
const handleMessage = async (messages: any[]) => {
  const rankList: any[] = [];
  const barrageList: any[] = [];
  const giftList: any[] = [];
  const welcomeList: any[] = [];
  const superChatList: any[] = [];
  const redPocketList: any[] = [];

  // 处理单独一条弹幕信息的数据解析
  const messageFormatter = async (message: any) => {
    const { cmd } = message;
    switch (cmd) {
      // 直播间排行榜列表，只需要得到前三名
      case MESSAGE_TYPE.RANK:
        await parseRank(message?.data);
        break;

      // 礼物信息
      case MESSAGE_TYPE.GIFT:
        await parseGift(message?.data);
        break;

      // 进入信息（文字）
      case MESSAGE_TYPE.INTERACT:
        await parseInteract(message?.data);
        break;

      // VIP进场信息展示
      case MESSAGE_TYPE.ENTRY:
        await parseVIPEntry(message?.data);
        break;

      // 在线排行榜前三名,已弃用
      // case MESSAGE_TYPE.TOP3:
      //   break;

      // 弹幕信息
      case MESSAGE_TYPE.DANMU:
        await parseDanmu(message?.info);
        break;

      // SC信息
      case MESSAGE_TYPE.SUPERCHAT:
        await parseSuperchat(message?.data);
        break;

      // 房间信息更新
      case MESSAGE_TYPE.ROOMCHANGE:
        // TODO 房间信息改变需要触发的操作
        break;

      // 直播开始
      case MESSAGE_TYPE.LIVESTART:
        await emit(LIVE_START_EVENT, message);
        break;

      // 直播关闭
      case MESSAGE_TYPE.LIVECLOSE:
        await emit(LIVE_END_EVENT, message);
        break;

      // 红包信息
      case MESSAGE_TYPE.REDPACKET:
        await parseRedpacket(message?.data);
        break;

      // 观看人数更新
      case MESSAGE_TYPE.WATCHCHANGE:
        await emit(WATCHED_CHANGE_EVENT, { num: message?.data?.num });
        break;

      // 舰长登船
      case MESSAGE_TYPE.GUARDBUY:
        await parseGuardBuy(message?.data);
        break;

      // 全屏提示
      case MESSAGE_TYPE.NOTICE_MSG:
        await parseNotice(message?.data);
        break;

      // 点赞
      case MESSAGE_TYPE.LIKE:
        await parseLike(message?.data);
        break;

      // 直播游戏
      case MESSAGE_TYPE.LIVEGAME:
        break;

      default:
        // console.log("未知消息类型", message)
        break;
    }
  };

  const parseRank = (data: any) => {
    const { list } = data;
    list.length > 3 && list.splice(3);
    rankList.splice(0);
    list.forEach((item: any) => rankList.push(item));
  };

  const parseGift = (data: any) => {
    const id = nanoid();

    giftList.push({
      id,
      barrage: {
        ...data,
        isGift: true
      },
      barrageType: "gift"
    });
  };

  const parseInteract = (data: any) => {
    const id = nanoid();

    let info: any;
    switch (data.msg_type) {
      case 1:
        info = {
          id,
          ...data,
          msg_type: "entry"
        };
        break;
      case 2:
        info = {
          id,
          ...data,
          msg_type: "follow"
        };
        break;
      case -10:
        // 高能用户
        info = {
          id,
          rankInfo: data.list[0],
          msg_type: "top3"
        };
        break;
      case -1:
        // 欢迎信息
        // info = {
        //   id,
        //   rankInfo: data.list[0],
        //   msg_type: "vip_entry"
        // };
        break;
      default:
        info = { id, ...data };
    }

    welcomeList.push({ ...info });
  };

  const parseVIPEntry = (data: any) => {
    const id = nanoid();

    welcomeList.push({
      id, ...data, msg_type: "vip_entry"
    });
  };

  const parseDanmu = async (info: any) => {
    const id = nanoid();

    const up_id = await getStore(LOGIN_INFO.uid);

    const barrageInfo = {
      uid: info[2][0],
      uname: info[2][1],
      message: info[1],
      isAnchor: info[2][0] === up_id,
      isManager: !!info[2][2], // 房管
      isGuard: info[7], // 舰队成员，1-总督，2-提督，3-舰长
      isEmoji: !!info[0][12], // 弹幕类型，0-文字，1-emoji
      emoji: info[0][13],
      unameColor: info[2][7],
      medal: info[3],
      backgroundColor: ""
    };
    const nameColor = barrageInfo.unameColor;

    if (nameColor) {
      barrageInfo.backgroundColor = colorHexToRgba(nameColor, 0.3) as string;
    }
    barrageList.push({
      id,
      barrage: barrageInfo,
      barrageType: "general"
    });

    // 处理抽奖弹幕/表情动画
    // if (
    //   barrageInfo.message === "老板大气！点点红包抽礼物！" ||
    //   barrageInfo.isEmoji
    // ) { break; }
  };

  const parseSuperchat = (data: any) => {
    const id = nanoid();

    superChatList.push({
      id,
      barrage: data,
      barrageType: "superchat"
    });
  };

  const parseRedpacket = (data: any) => {
    const id = nanoid();

    redPocketList.push({
      id,
      barrage: data,
      barrageType: "redpocket"
    });
    giftList.push({
      id,
      barrage: {
        ...data,
        giftId: data.gift_id,
        giftName: data.gift_name
      },
      barrageType: "redpocket"
    });
  };

  const parseGuardBuy = (data: any) => {
    const id = nanoid();

    giftList.push({
      id,
      barrage: {
        ...data,
        uname: data.username,
        giftId: data.gift_id,
        giftName: data.gift_name
      },
      barrageType: "guardbuy"
    });
  };

  const parseNotice = (data: any) => {
    console.log("全屏消息", data.toast_msg);
  };

  const parseLike = (data: any) => {
    const id = nanoid();
    barrageList.push({
      id,
      barrage: data,
      barrageType: "like"
    });
  };

  for (const message of messages) {
    await messageFormatter(message);
  }

  return {
    rankList,
    barrageList,
    giftList,
    welcomeList,
    superChatList,
    redPocketList
  };
};

export default handleMessage;
