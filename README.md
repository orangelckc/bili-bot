![image](https://user-images.githubusercontent.com/48375635/215230560-0f0e015a-daeb-4ba1-9ddb-78bbcb4ff75e.png)
# 哔哩哔哩-直播间管家机器人 ![stars](https://badgen.net/github/stars/orangelckc/bili-bot) ![forks](https://badgen.net/github/forks/orangelckc/bili-bot) ![realease](https://badgen.net/github/release/orangelckc/bili-bot)

基于Tauri+vue3+ts+Sqlite 的哔哩哔哩直播间管家机器人

请跳转至[Realease](https://github.com/orangelckc/bili-bot/releases)页面下载最新版本，进行体验

## 功能

### 机器人功能
- [x] 直播间弹幕监控
- [x] 直播间礼物监控
- [x] 直播间进入监控
- [x] 直播间关注监控
- [x] 直播间点赞监控
- [x] 主播开播/下播监控
- [x] 直播间定时发送欢迎词
- [x] 直播间签到打卡
- [x] 可连接GPT3机器人，使用@进行弹幕提问

### 直播间功能
- [x] 直播预览
- [x] 直播录制
- [x] 直播间弹幕/表情包发送

## 项目截图
![image](https://user-images.githubusercontent.com/48410934/215070351-91810c93-1042-4ad1-88be-fc85eb0c0af2.png)


## 项目依赖
- [Rust环境](https://tauri.app/zh-cn/v1/guides/getting-started/prerequisites#%E5%AE%89%E8%A3%85): 请自行根据官网步骤安装rust环境
- [Node.js](https://nodejs.org/en/): 用于运行项目
- [ffmpeg](https://ffmpeg.org/download.html): 用于直播录制功能，可选


## 项目运行
1. 安装依赖
```bash
npm install
```

2. 运行项目
```bash
npm run tauri dev
```
* 如果运行报错未找到`dist`文件夹，请先手动对前端进行打包
```bash
npm run build
```

3. 打包项目
```bash
npm run tauri build
```
- 如果需要打包后进行调试，请添加`--debug`参数
```bash
npm run tauri build --debug
```


4. 生成app图标，请自行替换/src-tauri/assets文件夹下的icon图标，任何图片格式均可以
```bash
npm run build:icon
```

## 其他
直播间相关数据存储在本地sqlite数据库中，可自行使用数据库管理工具进行查看

macOS下数据库路径为`/Users/用户名/Library/Application Support/bili-bot/sql.db`

windows下数据库路径为`C:\Users\用户名\AppData\Roaming\bili-bot\sql.db`

#### Contributors

<a href="https://github.com/orangelckc/bili-bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=orangelckc/bili-bot" />
</a>
