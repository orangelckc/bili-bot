import { emit, listen, once } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/api/dialog";
import dayjs from "dayjs";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { sendMessageApi, getMyFollowLiveInfo, getLiveStatusApi } from "@/api/live";
import { SendMessage, SetInterval } from "@/types";
import * as EVENTS from "@/constants/events";
import { chatGTPApi } from "@/api";
import { create_entry_sql, create_danmu_sql, create_gift_sql, sign_sql, formatUname } from "@/utils/initSQL";
import { reactive, ref, watch } from "vue";
import { Notify } from "quasar";

export const roomid = ref("3796382");
export const robotName = ref("闹闹");
export const hostName = ref("条条");
export const connected = ref(false);
export const active = ref(false);
export const msgList = ref<Record<string, any>>([]);
export const triggerOptions = reactive({
  like: true,
  follow: true,
  gift: true,
  welcome: true
});

const messages: string[] = [];
let todayFans = 0;

const online = `${hostName.value}的小管家${robotName.value}上钟咯，给大家请安～`;
const offline = `${robotName.value}要下线了，感谢大家的陪伴～`;

const welcome = [
  `欢迎新朋友们来到${hostName.value}的直播间～`,
  `${hostName.value}有才有德，有点帅，快来关注他吧～`,
  "发发弹幕，可以触发直播间好玩的互动功能哟～"
];

const intro = [
  `我是管家${robotName.value}，我会和${hostName.value}一起陪伴大家`,
  `可以在弹幕里@${robotName.value}，和我聊天一起玩哦～`
];

const bossList = [
  {
    uid: "",
    uname: "",
    nickname: ""
  }
];

const autoSlice = (str: string) => {
  const arr: string[] = [];
  if (str.length > 20) {
    arr.push(str.slice(0, 20));
    const newArr = autoSlice(str.slice(20, str.length));
    arr.push(...newArr);
  } else {
    arr.push(str);
  }
  return arr;
};

const onClock = (start: number) => {
  // 解析后是本地的时间
  const diff = dayjs().diff(dayjs(start * 1000));
  const minutes = Math.floor(diff / 1000 / 60);

  const str: string[] = [];
  if (minutes % 60 === 0) {
    str.push(`今天已经直播了${minutes / 60}小时，@${hostName.value}太棒了！`);
  }
  if (minutes % 40 === 0) {
    str.push(`@${hostName.value}累不累啊？喝点水休息一会吧～`);
    if (minutes / 60 > 3) { str.push(`${robotName.value}都困困了呢，@${hostName.value}真的好努力啊！`); }
  }
  if (dayjs().hour() === 16 && minutes % 30 === 0) {
    str.push(`@${hostName.value}: 记得去力扣每日打卡啊！`);
  }

  return str;
};

// 发送信息
const sendMessage = (value: string) => {
  const params: SendMessage = {
    dm_type: "0",
    msg: value,
    roomid: roomid.value
  };
  console.log(params.msg);
  sendMessageApi({ ...params, isInitiative: true });
};

// 进入人数每超过100，欢迎信息
const enter_num = ref(0);
let lastCount = 0;
watch(enter_num, (num) => {
  const diff = Date.now() - lastCount;
  if (num > 100 && diff > 1000 * 60 * 12) {
    if (!triggerOptions.welcome) return;
    messages.push(...welcome.concat(intro));
    enter_num.value = 0;
    lastCount = Date.now();
  };
});

const unlisteners: UnlistenFn[] = [];
const init_listener = async () => {
  // 清空监听
  unlisteners.forEach(unlisten => unlisten());
  unlisteners.length = 0;

  // 监听进入房间事件
  const entryListener = await listen(EVENTS.WELCOME_EVENT, (event) => {
    unlisteners.push(entryListener);

    const data = event.payload as Object[];
    data.forEach(async (item: any) => {
      if (item.msg_type === "follow") {
        // 关注事件
        if (!triggerOptions.follow) return;
        sendMessage(`感谢${formatUname(item.uname)}关注${hostName.value}~`);
      } else if (item.msg_type === "entry") {
        if (!active.value) return;

        // 大佬欢迎词
        if (bossList.findIndex(boss => boss.uid === "" + item.uid) !== -1) {
          messages.push(...autoSlice(`欢迎${formatUname(item.uname)}来到${hostName.value}的直播间～`));
        }

        enter_num.value += 1;
        create_entry_sql(item);
      } else if (item.msg_type === "vip_entry") {
        // 舰长等VIP进入
        if (!active.value) return;
        const str = item.copy_writing.replace(/<%|%>/g, " ");
        messages.push(...autoSlice(str));
      } else {
        console.log("其他进场触发", item);
      }
    });
  });

  // 监听弹幕事件
  const danmuListener = await listen(EVENTS.BARRAGE_MESSAGE_EVENT, (event) => {
    unlisteners.push(danmuListener);

    const data = event.payload as Object[]
    data.forEach(async (item: any) => {
      const { uname, message, isEmoji, uid } = item.barrage;
      message && msgList.value.push({ uname, message });
      if (!active.value) return;
      if (message && uname !== "闹闹今天吃糖了么") {
        if (message.includes(`@${robotName.value}`)) {
          const question = message.replace(`@${robotName.value}`, "").trim();
          if (question.includes("粉丝数") || question.includes("今日目标")) {
            const { by_room_ids } = await getLiveStatusApi(roomid.value);
            const curFans = by_room_ids[roomid.value].attention;
            messages.push(...autoSlice(`@条条 当前粉丝数${curFans}，今日已增长${curFans - todayFans}，冲～`));
            return;
          }
          const result = await chatGTPApi(question);
          if (!result) return;
          messages.push(...autoSlice(`@${formatUname(uname)}:${result}`));
        }
        message.includes("晚安") && messages.push(`晚安${formatUname(uname)}， 谢谢你的陪伴～`);
        message.includes("晚上好") && messages.push(`${formatUname(uname)}， 晚上好啊～`);
        (message.includes("新年好") || message.includes("新年快乐")) && messages.push(`@${formatUname(uname)}， 新年快乐，红包拿来～`);
        if (message === "签到" || message === "打卡") {
          const res = await sign_sql({ uid, uname, roomid: roomid.value });
          messages.push(...autoSlice(res));
        }
      }
      if (item.barrageType === "like") {
        // 点赞事件
        if (!triggerOptions.like) return;
        messages.push(...autoSlice(`感谢${formatUname(uname)}的点赞~`));
      } else {
        !isEmoji && create_danmu_sql({ ...item, roomid: roomid.value });
      }
    });
  });

  // 监听礼物事件
  const giftListener = await listen(EVENTS.GIFT_EVENT, (event) => {
    unlisteners.push(giftListener);

    if (!active.value) return;
    const data = event.payload as Object[];
    data.forEach(async (item: any) => {
      create_gift_sql({ ...item, roomid: roomid.value });
      if (!triggerOptions.gift) return;
      const { uname, giftName, giftId } = item.barrage;
      giftId !== 1 && messages.push(...autoSlice(`感谢${formatUname(uname)}赠送的${giftName || "礼物"}~`));
    });
  });

  // 监听直播开始事件
  const startListener = await listen(EVENTS.LIVE_START_EVENT, async (event) => {
    unlisteners.push(startListener);

    const data = event.payload as any;
    if (data.roomid === Number(roomid.value)) {
      active.value = true;
      await message(`${hostName.value}的直播开始了`, "直播通知");
    };
  });

  // 监听直播结束事件
  const stopListener = await listen(EVENTS.LIVE_END_EVENT, (event) => {
    unlisteners.push(stopListener);

    const data = event.payload as any;
    data.roomid === roomid.value && (active.value = false);
  });
};

let msgInterval: SetInterval;
let clockInterval: SetInterval;

watch(active, async (value) => {
  messages.length = 0;
  if (value) {
    //  开播后轮询直到获取到直播间信息再上线
    let loopLimit = 20;
    const liveInfoIntever = setInterval(async () => {
      const roomInfo = await getMyFollowLiveInfo();
      const target = roomInfo.rooms.find((room: { roomid: number; }) => room.roomid === parseInt(roomid.value));
      loopLimit -= 1;
      if (loopLimit === 0) clearInterval(liveInfoIntever);
      if (target !== undefined) {
        console.log("已得到直播间信息");
        clearInterval(liveInfoIntever);
        msgInterval = setInterval(() => {
          const message = messages.shift();
          if (!message) return;
          sendMessage(message);
        }, 1000 * 4);
        messages.push(online);
        messages.push(...intro);

        // 获取当前的粉丝量
        const { by_room_ids } = await getLiveStatusApi(roomid.value);
        todayFans = by_room_ids[roomid.value].attention;
        messages.push(`@条条 开播当前粉丝数：${todayFans}`);

        clockInterval = setInterval(() => {
          messages.push(...onClock(target.liveTime));
        }, 1000 * 60);
      }
    }, 1000 * 3);
  } else {
    clearInterval(msgInterval);
    clearInterval(clockInterval);
    sendMessage(offline);
  }
});

export const stopWebsocket = () => {
  active.value = false;
  connected.value = false;
  emit(EVENTS.CLOSE_WEBSOCKET_EVENT);
  unlisteners.forEach((unlistener) => unlistener());
};

export const startWebsocket = async () => {
  if (isNaN(Number(roomid.value))) {
    Notify.create("请输入正确的直播间号");
    roomid.value = "";
    return;
  }
  if (!hostName.value || !robotName.value) {
    Notify.create("请输入主播名称和机器人名称");
    return;
  }
  connected.value = true;
  emit(EVENTS.OPEN_WEBSOCKET_EVENT, { roomid: roomid.value });
  once(EVENTS.CONNECT_SUCCESS_EVENT, (event) => {
    console.log("ws连接成功");
  });
  init_listener();
};
