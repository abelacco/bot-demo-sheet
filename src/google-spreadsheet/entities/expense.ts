import { Message } from "src/context/entities/message.entity";
import { Utilities } from "src/context/helpers/utils";

export class Expense {
    fregistro: string;
    fegreso: string;
    partida: string;
    descripcion: string;
    monto: number;
    colaborador: string;
    constructor(message: Message) {
      this.fregistro = Utilities.today();
      this.fegreso = message.registerDate || '';
      this.partida = message.expenseTypeSelected || '';
      this.descripcion = message.description || '';
      this.monto = message.amount || 0;
      this.colaborador = message.workername || '';
    }
  
}
