import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    this.openai = new OpenAI({ apiKey, timeout: 15 * 1000 });
    if (!apiKey || apiKey.length === 0) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    this.model = model;
  }

  /**
   *
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
  async createChat  (
    messages: ChatCompletionMessageParam[],
    model?: string,
    temperature = 0,
  ) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? this.model,
        messages,
        temperature,
        max_tokens: 1500,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return completion.choices[0].message.content;
    } catch (err) {
      console.error(err);
      return 'ERROR';
    }
  };
}
