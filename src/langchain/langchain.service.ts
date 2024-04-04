import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from "@langchain/pinecone";
import { ChainIntentService } from './chain-intent.service';
import { PineconeService } from 'src/pinecone/pinecone.service';

@Injectable()
export class LangchainService {

  constructor(
    private chainIntent: ChainIntentService,
    private pineconeService: PineconeService
    ) {}

  async runChat(history: Array<{role: string; content: string} > = [], question: string, prompt:string) {
    try {
      const pinecone = await this.pineconeService.initPinecone();
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  
      const reversedHistory = history.reverse();
      const pastMessages = reversedHistory.map((message) => {
        return message.role === 'assistant' ? `AI: ${message.content}\n` : `Human: ${message.content}\n`;
      }).join('\n');
  
      const loadedVectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({}),
        {
          pineconeIndex: index,
          textKey: "text",
        }
      );
  
      const chain = this.chainIntent.create(loadedVectorStore, prompt);
      const sanitizedQuestion = question.trim().replace("\n", " ");
  
      const response = await chain.invoke({
        question: sanitizedQuestion,
        chatHistory: pastMessages
      });
    console.log(response);
      return { response };
    }
    catch (error) {
      console.log(error);
      return { error };
    }

  }


}
