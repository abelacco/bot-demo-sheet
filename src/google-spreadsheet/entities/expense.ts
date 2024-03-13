import { Ctx} from "src/context/entities/ctx.entity";
import { Utilities } from "src/context/helpers/utils";

export class Expense {
    fregistro: string;
    fegreso: string;
    partida: string;
    subpartida: string;
    descripcion: string;
    monto: number;
    colaborador: string;
    constructor(ctx: Ctx) {
      this.fregistro = Utilities.today();
      // this.fegreso = ctx.registerDate || '';
      // this.partida = ctx.accountSelected || '';
      // this.subpartida = ctx.subaccountSelected || '';
      // this.descripcion = ctx.description || '';
      // this.monto = ctx.amount || 0;
      // this.colaborador = ctx.workername || '';
    }
  
}
