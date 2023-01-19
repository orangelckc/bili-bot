import { emit, listen } from "@tauri-apps/api/event";
import { encode, decode } from "@/utils/socket";
import {
  WEBSOCKET_URL,
  BARRAGE_MESSAGE_EVENT,
  POPULARITY_EVENT,
  RANK_EVENT,
  GIFT_EVENT,
  WELCOME_EVENT,
  SUPER_CHAT_EVENT,
  OPEN_WEBSOCKET_EVENT,
  CLOSE_WEBSOCKET_EVENT,
  CONNECT_SUCCESS_EVENT
} from "@/constants";
import handleMessage from "@/utils/message";
import type { SetInterval } from "@/types";

let websocket: WebSocket;
let timer: SetInterval | null;

const useWebsocket = () => {
  // 开启长链接
  const openWebsocket = (roomid: number) => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = () => {
      websocket && websocket.readyState === websocket.OPEN && onConnect(roomid);
    };

    websocket.onmessage = (msgEvent) => onMessage(msgEvent);

    websocket.onerror = () => openWebsocket(roomid);

    // websocket.onclose = () => openWebsocket(roomid);
  };

  // 关闭长链接
  const closeWebsocket = () => {
    websocket && websocket.close();
    if (websocket.readyState !== 3) {
      websocket.close();
    }
  };

  // 发送连接信息
  const onConnect = (roomid: number) => {
    websocket.send(
      encode(
        JSON.stringify({
          protover: 1,
          clientver: "1.4.0",
          roomid
        }),
        7
      )
    );

    // 初始化人气
    websocket.send(encode("", 2));

    // 发送心跳
    timer = setInterval(() => {
      websocket && websocket.send(encode("", 2));
    }, 30000);
  };

  // 接收弹幕信息
  const onMessage = async (msgEvent: any) => {
    if (websocket.readyState === 3) {
      return websocket.close();
    }
    const result: any = await decode(msgEvent.data);

    switch (result.op) {
      case 3:
        // 发出人气信息
        await emit(POPULARITY_EVENT, result.body.count);
        break;
      case 5:
        messageEmits(result.body);
        break;
      case 8:
        await emit(CONNECT_SUCCESS_EVENT);
        break;
      default:
        console.log("没有捕获的op", result);
        break;
    }
  };

  const messageEmits = async (messages: any[]) => {
    const result = await handleMessage(messages);
    const { rankList, barrageList, giftList, welcomeList, superChatList } =
      result;

    // 针对不同的信息类型，分别发出事件
    barrageList.length && emit(BARRAGE_MESSAGE_EVENT, barrageList);
    rankList.length && emit(RANK_EVENT, rankList);
    giftList.length && emit(GIFT_EVENT, giftList);
    welcomeList.length && emit(WELCOME_EVENT, welcomeList);
    superChatList.length && emit(SUPER_CHAT_EVENT, superChatList);
  };

  const trigger = async () => {
    await listen<string>(OPEN_WEBSOCKET_EVENT, (event) => {
      const { room_id } = JSON.parse(event.payload);
      openWebsocket(room_id);
    });
    await listen(CLOSE_WEBSOCKET_EVENT, closeWebsocket);
  };

  return { trigger };
};

export default useWebsocket;