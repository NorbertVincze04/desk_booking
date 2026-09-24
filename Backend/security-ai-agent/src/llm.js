import "dotenv/config";
import { ProxyAgent } from "undici";
import { ChatOpenAI } from "@langchain/openai";

export const proxyUrl =
  process.env.https_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.http_proxy ||
  process.env.HTTP_PROXY;
const proxyAgent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

// Open-source model (OpenAI's Apache-2.0-licensed gpt-oss), served through
// OpenRouter's OpenAI-compatible API instead of the Bosch/Azure LLM farm.
export const modelEndpoint = "https://openrouter.ai/api/v1";
export const modelName = process.env.AI_MODEL || "openai/gpt-oss-120b";

export const llm = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: modelName,
  configuration: {
    baseURL: modelEndpoint,
    fetchOptions: proxyAgent ? { dispatcher: proxyAgent } : undefined,
  },
});
