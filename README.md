# bilibili 直播弹幕机器人
基于Tauri+vue3+ts+Sqlite 的哔哩哔哩直播间管家机器人

## 项目运行
1. 安装依赖
```bash
npm install
```

2. 运行项目
```bash
npm run tauri dev
```

3. 打包项目
```bash
npm run tauri build
```

4. 生成app图标，请自行替换/src-tauri/assets文件夹下的icon图标，任何图片格式均可以
```bash
npm run build:icon
```

## 直播录制功能
如果需要使用直播录制功能，请自行安装ffmpeg，参考[ffmpeg官网](https://ffmpeg.org/download.html)
