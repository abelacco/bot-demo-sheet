import { Module } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { LangchainController } from './langchain.controller';
import { ChainIntentService } from './chain-intent.service';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  controllers: [LangchainController],
  providers: [LangchainService, ChainIntentService],
  imports: [PineconeModule],
  exports: [LangchainService],
})
export class LangchainModule {}
