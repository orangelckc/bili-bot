import { Command, Child } from "@tauri-apps/api/shell";
import { message } from "@tauri-apps/api/dialog";
import { readDir, createDir } from "@tauri-apps/api/fs";
import { downloadDir } from "@tauri-apps/api/path";
import dayjs from "dayjs";

// 片段时长
const partDuration = "1800";
// 片段名
const segment = `part%03d`
// 文件后缀
const ext = ".mp4"

let child: Child

export const testFfmpge = async () => {
  let flag = false

  const ffprobe = new Command("ffmpeg-version", [
    "-version"
  ]);

  ffprobe.on("close", async ({ code }) => {
    if (code) {
      console.error("ffmepg 版本获取失败");
    } else {
      flag = true
    }
  });

  ffprobe.on("error", async (error) => {
    console.error(`command error: "${error}"`);
    message("ffmepg 版本获取失败, 请检查是否安装了 ffmpeg?");
  });

  await ffprobe.execute();
  return flag
}

export const startRecord = async (streamUrl: string, description: string) => {
  // 当前时间
  const timestamp = `${dayjs().format("YYYY-MM-DD HH")}点场`;
  // 直播录制存储路径
  const recordPath = `${await downloadDir()}${description}`;
  // 如果文件夹不存在则创建
  await readDir(recordPath).catch(async () => {
    await createDir(recordPath);
  });
  const recordName = `${recordPath}/${timestamp}_${segment}${ext}`;
  const args = [
    "-i",
    streamUrl,
    "-c:a",
    "copy",
    "-c:v",
    "copy",
    "-f",
    "segment",
    "-segment_time",
    partDuration,
    "-segment_start_number",
    "1",
    recordName,
  ]
  // 创建 ffmpeg 子进程
  const ffmpeg = new Command("record-live", args);

  // 注册子进程关闭事件
  ffmpeg.on("close", async ({ code }) => {
    if (code) {
      await message(`${description}-录制失败`);
    } else {
      await message(`${description}-录制完成!`);
    }
  });

  // 注册子进程异常事件
  ffmpeg.on("error", async (error) => {
    await message("文件录制错误");
    console.error(`command error: "${error}"`);
  });

  // 捕获标准输出
  // ffmpeg.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
  // 捕获标准错误
  // ffmpeg.stderr.on("data", (line) => {
  //   console.log(`command stderr: "${line}"`);
  // });

  // 执行 ffmpeg
  child = await ffmpeg.spawn();
};

export const stopRecord = async () => {
  // 在进程中输入q 退出录制
  await child.write("q");
}
