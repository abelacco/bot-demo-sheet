import { Module } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { UserModule } from 'src/user/user.module';
import { GeneralServicesModule } from 'src/general-services/general-services.module';
import { CtxModule } from 'src/context/ctx.module';
import { SenderModule } from 'src/sender/sender.module';
import { GoogleSpreadsheetModule } from 'src/google-spreadsheet/google-spreadsheet.module';
import { AiModule } from 'src/ai/ai.module';
import { HistoryModule } from 'src/history/history.module';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';
import { LangchainModule } from 'src/langchain/langchain.module';

@Module({
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
  imports: [ CtxModule,BuilderTemplatesModule , UserModule, GeneralServicesModule, SenderModule, GoogleSpreadsheetModule, AiModule, HistoryModule , GoogleCalendarModule, LangchainModule]
})
export class FlowsModule {}
