# Add Stripe to your agentic workflows

Use financial services with agents.

Use Stripe to run your agent business and enhance your agents’ functionality. By enabling access to financial services and tools, you allow your agents to help you earn and spend funds, expanding their capabilities.

## Create Stripe objects 

Use function calling to create and manage Stripe objects. For example, dynamically create [Payment Links](https://docs.stripe.com/payment-links.md) to accept funds, integrate into your support workflows to help customers, and scaffold test data.

The Stripe agent toolkit supports [OpenAI’s Agents SDK](https://github.com/openai/openai-agents-python), [Vercel’s AI SDK](https://sdk.vercel.ai/), [LangChain](https://www.langchain.com/), and [CrewAI](https://www.crewai.com/). It works with any LLM provider that supports function calling and is compatible with Python and TypeScript.

#### OpenAI Agents SDK

#### Python

```python
import asyncio
import os
from agents import Agent, Runner
from stripe_agent_toolkit.openai.toolkit import StripeAgentToolkit

stripe_agent_toolkit = StripeAgentToolkit(
    secret_key=os.getenv("STRIPE_SECRET_KEY"),
    configuration={
        "actions": {
            "payment_links": {
                "create": True,
            },
            "products": {
                "create": True,
            },
            "prices": {
                "create": True,
            },
        }
    },
)

agent = Agent(
    name="Stripe Agent",
    instructions="Integrate with Stripe effectively to support business needs.",
    tools=stripe_agent_toolkit.get_tools()
)

async def main():
    assignment = "Create a payment link for a new product called \"Test\" with a price of $100."

    result = await Runner.run(agent, assignment)

    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

#### Vercel AI SDK

#### Node.js

```javascript
import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const stripeAgentToolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
      products: {
        create: true,
      },
      prices: {
        create: true,
      },
    },
  },
});

const result = await generateText({
  model: openai('gpt-4o'),
  tools: {
    ...stripeAgentToolkit.getTools(),
  },
  maxSteps: 5,
  prompt: 'Create a payment link for a new product called \"Test\" with a price of $100.',
})
```

#### LangChain

#### Python

```python
from langchain.agents import AgentExecutor, create_structured_chat_agent
from stripe_agent_toolkit.langchain.toolkit import StripeAgentToolkit

stripe_agent_toolkit = StripeAgentToolkit(
    secret_key=os.getenv("STRIPE_SECRET_KEY"),
    configuration={
        "actions": {
            "payment_links": {
                "create": True,
            },
            "products": {
                "create": True,
            },
            "prices": {
                "create": True,
            },
        }
    },
)

agent = create_structured_chat_agent(llm, stripe_agent_toolkit.get_tools(), prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({
    "input": "Create a payment link for a new product called \"Test\" with a price of $100."
})
```

#### Node.js

```javascript
import { StripeAgentToolkit } from '@stripe/agent-toolkit/langchain';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

const stripeAgentToolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
      products: {
        create: true,
      },
      prices: {
        create: true,
      },
    },
  },
});

const agent = await createStructuredChatAgent({
  llm,
  tools: stripeAgentToolkit.getTools(),
  prompt,
});

const agentExecutor = new AgentExecutor({agent, tools});

const response = await agentExecutor.invoke({
  input: `
    Create a payment link for a new product called \"Test\" with a price of $100.
  `,
});
```

#### CrewAI

#### Python

```python
from crewai import Agent, Task, Crew
from stripe_agent_toolkit.crewai.toolkit import StripeAgentToolkit

stripe_agent_toolkit = StripeAgentToolkit(
    secret_key=os.getenv("STRIPE_SECRET_KEY"),
    configuration={
        "actions": {
            "payment_links": {
                "create": True,
            },
            "products": {
                "create": True,
            },
            "prices": {
                "create": True,
            },
        }
    },
)

stripe_agent = Agent(
    role="Stripe Agent",
    goal="Integrate with Stripe effectively to support business needs.",
    backstory="You are a Stripe expert.",
    tools=[*stripe_agent_toolkit.get_tools()]
)

create_payment_link = Task(
    description="Create a payment link for a new product called \"Test\" with a price of $100.",
    expected_output="url",
    agent=stripe_agent
)

crew = Crew(
    agents=[stripe_agent],
    tasks=[create_payment_link],
    planning=True
)

crew.kickoff()
```

> Learn how to use this SDK to integrate Stripe into agentic workflows. Because agent behavior is non-deterministic, use the SDK in a [sandbox](https://docs.stripe.com/sandboxes.md) and run evaluations to assess your application’s performance. Additionally, use [restricted API keys](https://docs.stripe.com/keys.md#create-restricted-api-secret-key) to limit access to the functionality your agent requires.

## Charge for agent usage 

### Agents SDKs

Integrate [usage-based billing](https://docs.stripe.com/billing/subscriptions/usage-based.md) to record usage. The Stripe agent toolkit offers native support for billing by prompt and completion token usage in the OpenAI Agents SDK and Vercel AI SDK. You can forward LLM costs directly to your users using a [Customer](https://docs.stripe.com/api/customers/object.md) and `event_name`s for input and output [Meter Events](https://docs.stripe.com/api/billing/meter-event/object.md).

#### OpenAI Agents SDK

```python
from agents import Agent, Runner
from stripe_agent_toolkit.openai.toolkit import StripeAgentToolkit

stripe_agent_toolkit = StripeAgentToolkit(
    secret_key=os.getenv("STRIPE_SECRET_KEY"),
    configuration={}
)

agent = Agent(
    name="Agent",
    instructions="Integrate with Stripe effectively to support business needs.",
    hooks=stripe_agent_toolkit.billing_hook(
        type="token",
        customer=os.getenv("STRIPE_CUSTOMER_ID"),
        meters={
            "input": os.getenv("STRIPE_METER_INPUT"),
            "output": os.getenv("STRIPE_METER_OUTPUT"),
        },
    ),
)
```

#### Vercel AI SDK

```javascript
import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { openai } from '@ai-sdk/openai';
import {
  experimental_wrapLanguageModel as wrapLanguageModel,
} from 'ai';

const model = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: stripeAgentToolkit.middleware({
    billing: {
      customer: process.env.STRIPE_CUSTOMER_ID!,
      meters: {
        input: process.env.STRIPE_METER_INPUT!,
        output: process.env.STRIPE_METER_OUTPUT!,
      },
    },
  }),
});
```

### Model Context Protocol servers   (Public preview)

[Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) is an open protocol to standardize how applications provide context to LLMs. The Stripe Agent toolkit offers wrapper functions to monetize your tool calls on hosted MCP servers.

#### Cloudflare

See Cloudflare’s [Agent SDK documentation](https://developers.cloudflare.com/agents/guides/remote-mcp-server/) for more details.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpAgent } from "agents/mcp";
import { generateImage } from "./imageGenerator";
import { OAuthProvider } from "@cloudflare/workers-oauth-provider";import {
  PaymentState,
  experimental_PaidMcpAgent as PaidMcpAgent,
} from '@stripe/agent-toolkit/cloudflare';
import app from "./app";

type Bindings = Env;

type Props = {// Populate this via OAuth
  userEmail: string;
};

type State = {};
export class MyMCP extends PaidMcpAgent<Bindings, State, Props> {
  server = new McpServer({
    name: "Demo",
    version: "1.0.0",
  });

  initialState: State = {};

  async init() {
    // Usage-based metered payments (Each tool call requires a payment)this.paidTool(
      'generate_emoji',
      'Generate an emoji given a single word (the `object` parameter describing the emoji)',
      {
        object: z.string().describe('one word'),
      },
      ({object}) => {
        return {
          content: [{type: 'text', text: generateImage(object)}],
        };
      },{
        checkout: {
          success_url: '{{SUCCESS_URL}}',
          line_items: [
            {
              price: "{{PRICE_ID}}",
            },
          ],
          mode: 'subscription',
        },
        meterEvent: 'image_generation',
        paymentReason: 'You get 3 free generations, then we charge 10 cents per generation.',
      }
    );
  }
}

export default new OAuthProvider({
  apiRoute: "/sse",
  apiHandler: MyMCP.mount("/sse"),
  defaultHandler: app,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
```

#### Vercel

See Vercel’s [MCP handler documentation](https://vercel.com/docs/mcp) for more details.

```ts
import { createMcpHandler } from "@vercel/mcp-adapter";
import { generateImage } from "./generateImage"
import { z } from "zod";

import { registerPaidTool } from "@stripe/agent-toolkit/modelcontextprotocol";
import { withAuth } from "@/lib/withAuth";

const handlerWithAuth = withAuth((request) => {
  const email = request.headers.get("x-user-email");

  return createMcpHandler(
    async (server) => {
      registerPaidTool(
        server,
        "generate_image",
        "Generate an image",
        {
          prompt: z.string(),
        },
        async ({ prompt }) => {
          const imageUrl = await generateImage(prompt);
          return {
            content: [{ type: "image", data: imageUrl, mimeType: "image/png" }],
          };
        },
        {
          checkout: {
            success_url: '{{SUCCESS_URL}}',
            line_items: [
              {
                price: "{{PRICE_ID}}",
              },
            ],
            mode: 'subscription',
          },
          meterEvent: 'image_generation',
          paymentReason: 'You get 3 free generations, then we charge 10 cents per generation.',
          stripeSecretKey:" <<YOUR_SECRET_KEY>>",
          userEmail: email ?? "",
        }
      );
    }, {}, {
      redisUrl: process.env.REDIS_URL,
      sseEndpoint: "/sse",
      streamableHttpEndpoint: "/mcp",
      verboseLogs: false,
      maxDuration: 60,
    }
  )(request);
});

export {
  handlerWithAuth as GET,
  handlerWithAuth as POST,
  handlerWithAuth as DELETE,
};
```

To search Stripe documentation and query your Stripe data, use the [Stripe MCP server](https://docs.stripe.com/mcp.md).

## Buy goods online (Private preview) 

[Issuing](https://docs.stripe.com/issuing.md): Create single-use virtual cards for your business purchases. This allows your agents to spend funds. The Issuing APIs allow you to programmatically approve or decline authorizations, ensuring your purchase intent matches the authorization. Spending controls allow you to set budgets and limit spending for your agents.

## Next steps

- [Agent quickstart](https://docs.stripe.com/agents/quickstart.md)
- [Agent toolkit on GitHub](https://github.com/stripe/ai/tree/main/tools)
- [B2B payments with Issuing](https://docs.stripe.com/baas/start-integration/integration-guides/b2b-payments.md)