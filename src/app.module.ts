import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WspWebHookModule } from './wsp-web-hook/wsp-web-hook.module';
import { SenderModule } from './sender/sender.module';
import { CtxModule } from './context/ctx.module';
import { BuilderTemplatesModule } from './builder-templates/builder-templates.module';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowsModule } from './flows/flows.module';
import { GeneralServicesModule } from './general-services/general-services.module';
import { UserModule } from './user/user.module';
import { BotModule } from './bot/bot.module';
import { GoogleSpreadsheetModule } from './google-spreadsheet/google-spreadsheet.module';
import { AiModule } from './ai/ai.module';
import { HistoryModule } from './history/history.module';
import { LangchainModule } from './langchain/langchain.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { WspWebGatewayModule } from './wsp-web-gateway/wsp-web-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true,
    }),
    MongooseModule.forRoot(`${process.env.MONGODB}/${process.env.DB_NAME}`),
    WspWebHookModule, SenderModule, CtxModule, BuilderTemplatesModule, FlowsModule, GeneralServicesModule , UserModule,BotModule, GoogleSpreadsheetModule, AiModule, HistoryModule, LangchainModule, PineconeModule, WspWebGatewayModule, WspWebGatewayModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
