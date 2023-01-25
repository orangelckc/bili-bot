import { Command } from "@tauri-apps/api/shell";
import { readDir, createDir } from "@tauri-apps/api/fs";
import { downloadDir } from "@tauri-apps/api/path";
import dayjs from "dayjs";

export const recordPath = async (folder: string) =>
  `${await downloadDir()}${folder}`;

export const testFfmpge = () =>
  new Command("ffmpeg-version").execute();

export const newRecorder = async (streamUrl: string, folder: string, description: string) => {
  // 片段时长
  const partDuration = "1800";
  // 片段名
  const segment = `part%03d`
  // 文件后缀
  const ext = ".mp4"
  // 当前时间
  const timestamp = `${dayjs().format("YYYY-MM-DD HH")}点场`;
  // 直播录制存储路径
  const path = await recordPath(folder);

  // 如果文件夹不存在则创建
  await readDir(path).catch(async () => {
    await createDir(path);
  });
  const recordName = `${path}/${timestamp}-${description}-${segment}${ext}`;
  const args = [
    "-i",
    `${streamUrl}`,
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
  return new Command("record-live", args);
};
