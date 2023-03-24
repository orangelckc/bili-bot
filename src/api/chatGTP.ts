
import { MANAGE } from "@/constants";
import { getStore } from "@/store";
import { Body } from "@tauri-apps/api/http";
import { getQueryData } from ".";

const API_KEY = await getStore(MANAGE.gptToken) || ''
const MAX_TOKENS = 100;
const MODEL = "gpt-3.5-turbo-0301"; // 功能最全的模型

const chatGTPApi = async (question: string) => {
  const prompts = [
    {
      role: 'system',
      content: '你是一个快问快答机器人，用10个字回答问题，注意：不能超过10个字，不要给我发代码！'
    }, {
      role: 'user',
      content: question
    }
  ]


  const res = await getQueryData(
    `${import.meta.env.VITE_PROXY_URL}/v1/chat/completions`,
    {
      method: "POST",
      body: Body.json({
        model: MODEL,
        messages: prompts,
        temperature: 0.6,
        max_tokens: MAX_TOKENS
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      returnError: true
    }
  );
  console.log("chatGTP回答：", res);
  return res.choices[0].message.content.replace(/？*\?*\s*\r*/g, "");
};

export { chatGTPApi };
