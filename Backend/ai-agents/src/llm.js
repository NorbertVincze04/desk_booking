import { fetch, ProxyAgent } from "undici";
import { AzureChatOpenAI } from "@langchain/openai";

const proxyUrl =
  process.env.https_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.http_proxy ||
  process.env.HTTP_PROXY;

const proxyAgent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

export const llm = new AzureChatOpenAI({
  apiKey: process.env.GENAIPLATFORM_FARM_SUBSCRIPTION_KEY,
  azureOpenAIApiDeploymentName: "gpt-5-nano-2025-08-07",
  azureOpenAIEndpoint: "https://aoai-farm.bosch-temp.com/api",
  configuration: {
    defaultHeaders: {
      "genaiplatform-farm-subscription-key":
        process.env.GENAIPLATFORM_FARM_SUBSCRIPTION_KEY,
    },
    fetch: proxyAgent ? fetch : undefined,
    fetchOptions: proxyAgent ? { dispatcher: proxyAgent } : undefined,
  },
  openAIApiVersion: "2025-04-01-preview",
});
