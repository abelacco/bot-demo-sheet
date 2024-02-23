import { Module } from '@nestjs/common';
import { CtxService } from './ctx.service';
import { CtxController } from './ctx.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { MongoDbService } from './db/mongodb.service';

@Module({
  controllers: [CtxController],
  providers: [CtxService, MongoDbService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    ],
  exports: [CtxService,MongoDbService],
})
export class CtxModule {}
