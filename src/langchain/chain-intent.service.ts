import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { formatDocumentsAsString } from 'langchain/util/document';

@Injectable()
export class ChainIntentService {
    create(vectorstore) {
        const questionPrompt = PromptTemplate.fromTemplate(`Tu extenso template aquí...`);
    
        const model = new ChatOpenAI({ modelName: 'gpt-3.5-turbo' });
        const retriever = vectorstore.asRetriever(10);
        const chain = RunnableSequence.from([
          {
            question: (input) => input.question,
            chatHistory: (input) => input.chatHistory,
            context: async (input) => {
              const relevantDocs = await retriever.getRelevantDocuments(input.question);
              return formatDocumentsAsString(relevantDocs);
            },
          },
          questionPrompt,
          model,
          new StringOutputParser(),
        ]);
    
        return chain;
      }
}
