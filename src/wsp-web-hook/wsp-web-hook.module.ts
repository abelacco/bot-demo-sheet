import { Module } from '@nestjs/common';
import { WspWebHookService } from './wsp-web-hook.service';
import { WspWebHookController } from './wsp-web-hook.controller';
import { BotModule } from 'src/bot/bot.module';


@Module({
  imports: [BotModule],
  controllers: [WspWebHookController],
  providers: [WspWebHookService],


})
export class WspWebHookModule {}
