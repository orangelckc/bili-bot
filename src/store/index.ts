import { Store } from "tauri-plugin-store-api";
import { STORE_DEFAULT_VALUES } from "@/constants";

// 创建配置文件
const configFile = import.meta.env.DEV ? ".config.dev.dat" : ".config.dat";
const store = new Store(configFile);

// 初始化配置
const initStore = async () => {
  try {
    await store.load();
    // 合并初始配置和用户自定义配置，防止缺少配置项
    for (const key of Object.keys(STORE_DEFAULT_VALUES)) {
      const setValue = (await getStore(key)) || STORE_DEFAULT_VALUES[key];
      await setStore(key, setValue);
    }
    console.log('store', store)
    await saveStore();
  } catch (error) {
    for (const key of Object.keys(STORE_DEFAULT_VALUES)) {
      const defaultValue = STORE_DEFAULT_VALUES[key];
      await setStore(key, defaultValue);
    }
  }
};

// 获取配置参数
const getStore = async (key: string): Promise<any> =>
  (await store.get(key)) as any;

// 设置配置参数
const setStore = async (key: string, value: string | boolean) => {
  try {
    await store.set(key, value);
    await saveStore();
  } catch (error) { }
};

// 写入配置文件
const saveStore = async () => {
  try {
    await store.save();
  } catch (error) {
    console.log("写入配置失败：", error);
  }
};

// 删除配置参数
const deleteStore = async (key: string) => {
  try {
    await store.delete(key);

    await saveStore();
  } catch (error) { }
};

// 清空所有配置
const clearStore = async () => {
  try {
    await store.clear();

    await saveStore();
  } catch (error) { }
};

export { initStore, getStore, setStore, deleteStore, clearStore };
