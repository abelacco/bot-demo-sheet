import { Ctx} from "src/context/entities/ctx.entity";
import { Utilities } from "src/context/helpers/utils";

export class Appointment {
    fregistro: string;
    fcita: string;
    cliente: string;
    email: string;
    celular: string;
    constructor(ctx: Ctx) {
      this.fregistro = Utilities.today();
      this.fcita = ctx.dateSelected || '';
      this.cliente = ctx.clientname || '';
      this.email = ctx.email || '';
      this.celular = ctx.clientPhone || '';
      // this.fegreso = ctx.registerDate || '';
      // this.partida = ctx.accountSelected || '';
      // this.subpartida = ctx.subaccountSelected || '';
      // this.descripcion = ctx.description || '';
      // this.monto = ctx.amount || 0;
      // this.colaborador = ctx.workername || '';
    }
  
}
