import Anthropic from "@anthropic-ai/sdk";

export const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const HYPOTHESIS_MODEL = "claude-opus-5-5";
export const PERSONA_MODEL = "claude-sonnet-5-5";
export const LEARNING_MODEL = "claude-sonnet-5-5";
