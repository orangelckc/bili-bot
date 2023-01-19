import { version } from '../../package.json'
import { configDir } from '@tauri-apps/api/path'

const STORE_DEFAULT_VALUES: Record<string, any> = {
  version
};
// 本地配置文件路径
const STORE_DEFAULT_PATH = await configDir() + 'bili-bot';

export { STORE_DEFAULT_VALUES, STORE_DEFAULT_PATH };
