import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { FlowsModule } from 'src/flows/flows.module';
import { CtxModule } from 'src/context/ctx.module';

@Module({
  controllers: [BotController],
  providers: [BotService, ],
  imports: [
    CtxModule,
    FlowsModule,
    ],
  exports: [BotService],
})
export class BotModule {}
