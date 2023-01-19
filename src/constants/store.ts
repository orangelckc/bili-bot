import { configDir } from "@tauri-apps/api/path";
import { version } from '../../package.json'
const STORE_DEFAULT_VALUES: Record<string, any> = {
  version,
  config: {
    login_info: {
      cookie: "",
      csrf: "",
      uid: "",
      uname: "",
      avatar: "",
    }
  }
};

export { STORE_DEFAULT_VALUES };
