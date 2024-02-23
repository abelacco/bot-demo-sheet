import { Injectable, Logger } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { MongoDbService } from './db/mongodb.service';
import { IMessageDao } from './db/messageDao';


@Injectable()
export class CtxService {
  private readonly _db: IMessageDao;

  constructor(
    private readonly _mongoDbService: MongoDbService,
  ) {
    this._db = this._mongoDbService;

  }


  async findOrCreateCtx({ clientPhone }): Promise<Message> {
    //Busca mensaje por número de cliente
    const message = await this._db.findOrCreate(clientPhone);

    return message;
  }

  async updateCtx(id:string,ctx:Message): Promise<Message> {
    //Busca mensaje por número de cliente
    const updatedMessage = await this._db.updateMessage(id,ctx);

    return updatedMessage;
  }

}
