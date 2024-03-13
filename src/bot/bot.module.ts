import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { FlowsModule } from 'src/flows/flows.module';
import { CtxModule } from 'src/context/ctx.module';
import { HistoryModule } from 'src/history/history.module';
import { AiValidator } from './helpers/aiValidator';
import { AiModule } from 'src/ai/ai.module';

@Module({
  controllers: [BotController],
  providers: [BotService,AiValidator ],
  imports: [
    CtxModule,
    FlowsModule,
    HistoryModule,
    AiModule
    ],
  exports: [BotService],
})
export class BotModule {}
