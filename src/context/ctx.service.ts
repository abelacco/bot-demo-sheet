import { Injectable, Logger } from '@nestjs/common';
import { Ctx} from './entities/ctx.entity';
import { MongoDbService } from './db/mongodb.service';
import { ICtxDao } from './db/ctxDao';
import { UpdateCtxDto } from './dto';
// import { UpdateCtxDto } from '../bot/dto/update-message.dto';


@Injectable()
export class CtxService {
  private readonly _db: ICtxDao;

  constructor(
    private readonly _mongoDbService: MongoDbService,
  ) {
    this._db = this._mongoDbService;

  }


  async findOrCreateCtx({ clientPhone }): Promise<Ctx> {
    //Busca mensaje por número de cliente
    const message = await this._db.findOrCreate(clientPhone);

    return message;
  }

  async updateCtx(id:string,updateCtx: UpdateCtxDto): Promise<Ctx> {
    //Busca mensaje por número de cliente
    const updatedMessage = await this._db.updateCtx(id,updateCtx);

    return updatedMessage;
  }

}
