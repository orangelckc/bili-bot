
import { Body } from "@tauri-apps/api/http";
import { getQueryData } from ".";

const API_KEY = "";
const MAX_TOKENS = 100;
const MODEL = "text-davinci-003"; // 功能最全的模型
// const MODEL = "text-curie-001	"; // 适合聊天的模型

const chatGTPApi = async (question: string) => {
  const str = `请用10个字回答问题：${question}`;
  const res = await getQueryData(
    "https://api.openai.com/v1/completions",
    {
      method: "POST",
      body: Body.json({
        model: MODEL,
        prompt: str,
        max_tokens: MAX_TOKENS
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      returnError: true
    }
  );
  console.log("chatGTP回答：", res);
  return res.choices[0].text.replace(/？*\?*\s*\r*/g, "");
};

export { chatGTPApi };
