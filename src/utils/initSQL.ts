import SQLite from "tauri-plugin-sqlite-api";
import dayjs from "dayjs";
import { STORE_DEFAULT_PATH } from "@/constants";

// 初始化数据库, 创建弹幕表，礼物表，进场表, 签到表
const danmus_init = `
  CREATE TABLE IF NOT EXISTS danmus (id TEXT, time INTEGER, uid TEXT, roomid TEXT, msg TEXT, uname TEXT);
`;
const gifts_init = `
  CREATE TABLE IF NOT EXISTS gifts (id TEXT, time INTEGER, uid TEXT, roomid TEXT, uname TEXT, giftId TEXT, gift TEXT, num INTEGER, price INTEGER);
`;
const entrys_init = `
  CREATE TABLE IF NOT EXISTS entrys (id TEXT, time INTEGER, uid TEXT, roomid TEXT, uname TEXT);
`;
const signs_init = `
  CREATE TABLE IF NOT EXISTS signs (id TEXT, time INTEGER, uid TEXT, roomid TEXT, uname TEXT);
`;

const dbFile = import.meta.env.DEV ? "sql.dev.db" : "sql.db";
const db = await SQLite.open(`${STORE_DEFAULT_PATH}/${dbFile}`);

const initSQL = async () => {
  if (!db) return console.log("数据库连接失败");

  try {
    await db.execute(danmus_init);
    await db.execute(gifts_init);
    await db.execute(entrys_init);
    await db.execute(signs_init);
    console.log("数据库初始化成功");
  } catch (error) {
    console.log(`数据库初始化失败,${error}`);
  }
};

const executeSQL = async (sql: string) => {
  try {
    await db.execute(sql);
  } catch (error) {
    console.log(`SQL执行失败,${error}`, sql);
  }
};

const create_entry_sql = (data: any) => {
  const { id, trigger_time, uid, roomid, uname } = data;
  const sql = `INSERT INTO entrys VALUES ('${id}', ${trigger_time}, '${uid}', '${roomid}', '${uname}');`;
  executeSQL(sql);
};

const create_danmu_sql = async (data: any) => {
  data = { id: data.id, roomid: data.roomid, ...data.barrage };
  const { id, uid, message, roomid, uname } = data;
  const sql = `INSERT INTO danmus VALUES ('${id}', ${Date.now()}, '${uid}', '${roomid}', '${message}', '${uname}');`;
  executeSQL(sql);
};

const create_gift_sql = (data: any) => {
  data = { id: data.id, roomid: data.roomid, ...data.barrage };
  const { id, roomid, giftId, giftName, num, price, timestamp, uid, uname } = data;

  const sql = `INSERT INTO gifts VALUES ('${id}', ${timestamp * 1000 || Date.now()}, '${uid}', '${roomid}', '${uname}','${giftId}', '${giftName}', ${num}, ${price});`;
  executeSQL(sql);
};

const sign_sql = async (data: any) => {
  const { uid, uname, roomid } = data;
  const today = dayjs();
  const todayStart = today.startOf("date").valueOf();
  const todayEnd = today.endOf("date").valueOf();

  // 查询今天日否已经打卡
  const already_sign_sql = `SELECT COUNT(*) as count FROM signs WHERE uid = '${uid}' AND roomid='${roomid}' AND time > ${todayStart} AND time < ${todayEnd};`;
  const isSigned = await db.select<Array<{ count: number }>>(already_sign_sql);
  if (!isSigned[0].count) {
    const sql = `INSERT INTO signs VALUES ('${crypto.randomUUID()}', ${Date.now()}, '${uid}', '${roomid}', '${uname}');`;
    await executeSQL(sql);
  }

  // 返回统计数据
  // 当天打卡次序
  const today_list_sql = `SELECT uid FROM signs WHERE roomid='${roomid}' AND time > ${todayStart} AND time < ${todayEnd} ORDER BY time;`;
  const today_list = await db.select<Array<{ uid: string }>>(today_list_sql);
  const todayCount = today_list.findIndex((item) => item.uid === "" + uid) + 1;
  // 连续打卡计数
  const uid_sign_sql = `SELECT time FROM signs WHERE roomid='${roomid}' AND uid = '${uid}' ORDER BY time DESC;`;
  const list = await db.select<Array<{ time: string }>>(uid_sign_sql);
  // 算法核心：判断逆序排序的相邻时间相差是否>1天
  let seqCount = 0;
  list.reduce((pre: any, cur, index, arr) => {
    const preStart = dayjs(pre.time).startOf("date").valueOf();
    const curStart = dayjs(cur.time).startOf("date").valueOf();
    const diff = dayjs(preStart).diff(dayjs(curStart), "day");
    if (diff === 1) {
      seqCount += 1;
    } else if (diff > 1) {
      arr.splice(index);
    }

    return cur;
  }, Date.now());

  // 本月打卡次数
  const month_start = today.startOf("month").valueOf();
  const month_end = today.endOf("month").valueOf();
  const month_sign_sql = `SELECT COUNT(*) as count FROM signs WHERE roomid='${roomid}' AND uid = '${uid}' AND time > ${month_start} AND time < ${month_end};`;
  const monthCount = await db.select<Array<{ count: number }>>(month_sign_sql);

  return `@${formatUname(uname)} 签到成功，您是今天第${todayCount}位，本月已签到${monthCount[0].count}次，连续签到${seqCount}天。`;
};

const formatUname = (uname: string) => {
  if(!uname) return ""
  
  return uname.length > 6 ? uname.slice(0, 6) + "..." : uname;
};

export { initSQL, create_entry_sql, create_danmu_sql, create_gift_sql, sign_sql, formatUname };
