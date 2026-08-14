import dotenv from "dotenv";
dotenv.config({ override: true });
import { fetch, ProxyAgent } from "undici";
import { AzureChatOpenAI } from "@langchain/openai";

export const proxyUrl =
  process.env.https_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.http_proxy ||
  process.env.HTTP_PROXY;

export const azureOpenAIEndpoint = "https://aoai-farm.bosch-temp.com/api";

const proxyAgent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

const proxiedFetch = proxyAgent
  ? (url, init) => fetch(url, { ...init, dispatcher: proxyAgent })
  : undefined;

export const llm = new AzureChatOpenAI({
  apiKey: process.env.GENAIPLATFORM_FARM_SUBSCRIPTION_KEY,
  azureOpenAIApiDeploymentName: "gpt-5-nano-2025-08-07",
  azureOpenAIEndpoint,
  configuration: {
    defaultHeaders: {
      "genaiplatform-farm-subscription-key":
        process.env.GENAIPLATFORM_FARM_SUBSCRIPTION_KEY,
    },
    fetch: proxiedFetch,
  },
  openAIApiVersion: "2025-04-01-preview",
});
