import { Injectable } from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { BTN_ID, BTN_OPT_CONFIRM_DNI, BTN_OPT_CONFIRM_GENERAL, BTN_OPT_CURRENT_DATE, BTN_OPT_PAYMENT, MENU, NAME_TEMPLATES, PACK, PAYMENTSTATUS, STEPS } from 'src/context/helpers/constants';
import { Message } from 'src/context/entities/message.entity';
import { UserService } from 'src/user/user.service';
import { GeneralServicesService } from 'src/general-services/general-services.service';
import axios from 'axios';
import { IParsedMessage } from 'src/builder-templates/interface';
import { CtxService } from 'src/context/ctx.service';
import { SenderService } from 'src/sender/sender.service';
import { Utilities } from 'src/context/helpers/utils';
import { GoogleSpreadsheetService } from 'src/google-spreadsheet/google-spreadsheet.service';
import { Expense } from 'src/google-spreadsheet/entities';

@Injectable()
export class FlowsService {

  constructor(
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly userService: UserService,
    private readonly generalService: GeneralServicesService,
    private readonly ctxService: CtxService,
    private readonly senderService: SenderService,
    private readonly googleSpreadsheetService: GoogleSpreadsheetService,
    ) {
    }
  async initFlow(ctx:Message ,messageEntry: IParsedMessage) {
    // aca debo llamar al flow para registar al cliente , si es nuevo o si ya existe
    const clientPhone = messageEntry.clientPhone;
    const worker = await this.googleSpreadsheetService.getUser(clientPhone)
    if(!worker) {
      const message = 'Este no es un número registrado, por favor comunícate con el administrador';
      await this.senderService.sendMessages(this.builderTemplate.buildTextMessage(clientPhone,message));
      return 
    }
    const workerName = worker.name;
    ctx.workername = workerName;
    ctx.workerPhone = worker.phoneNumber;
    const message1 = `Hola ${workerName}, soy ControllerBot, el asistente virtual de Doers, yo te ayudaré a registrar tus compras🤖`;
    const message2 = 'Cada vez que deseas ingresar una nueva compra debes escribir *egreso*';
    const template1 = this.builderTemplate.buildTextMessage(clientPhone,message1);
    await this.senderService.sendMessages(template1);
    const template2 = this.builderTemplate.buildTextMessage(clientPhone,message2);
    await this.senderService.sendMessages(template2);
    const template3 = this.builderTemplate.buildTextMessage(clientPhone,'*ESTO ES UN BOT DE PRUEBA DESARROLLADO POR THE FAMILY BOT \nNO ES UN CANAL OFICIAL DE DOERS, MAYOR INFORMACÓN DIRECTAMEN EN SUS RRSS*');
    await this.senderService.sendMessages(template3);
    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.listExpensesFlow(ctx,messageEntry);
  }

  async listExpensesFlow(ctx:Message ,messageEntry: IParsedMessage) {
    const clientPhone = messageEntry.clientPhone;
    const expenses = await this.googleSpreadsheetService.getExpenseTypeWithLimits();
    const buttonText = 'Ver mi partidas';
    const sections = Utilities.generateOneSectionTemplate('Lista de partidas',expenses); // Wrap sections inside an array
    const headerText = 'Elige la partida que deseas registrar';
    const bodyText = 'Para escoger una partida, selecciona el botón de "Ve mi partidas"';
    const message = 'Selecciona una opción';
    const template = this.builderTemplate.buildInteractiveListMessage(clientPhone,buttonText ,sections, headerText, bodyText ,message);
    await this.senderService.sendMessages(template);
    ctx.step = STEPS.EXPENSETYPE_SELECTED;
    await this.ctxService.updateCtx(ctx._id, ctx);
  }

  async getDescriptionFlow(ctx:Message ,messageEntry: IParsedMessage) {
    ctx.expenseTypeSelected = messageEntry.content.title;
    const expenses = await this.googleSpreadsheetService.getExpenseTypeWithLimits();
    const limit = expenses.find(expense => expense.expenseType === ctx.expenseTypeSelected).limit;
    ctx.limit = limit;
    const clientPhone = messageEntry.clientPhone;
    const message = 'Ingresa la descripción del gasto';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    await this.senderService.sendMessages(template);
    ctx.step = STEPS.DESCRIPTION_INSERTED;
    await this.ctxService.updateCtx(ctx._id, ctx);
  }

  async getAmountFlow(ctx:Message ,messageEntry: IParsedMessage) {
    ctx.description = messageEntry.content;
    const clientPhone = messageEntry.clientPhone;
    const message = 'Ingresa el monto de la partida';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    await this.senderService.sendMessages(template);
    ctx.step = STEPS.AMOUNT_INSERTED;
    await this.ctxService.updateCtx(ctx._id, ctx);
  }

  async getDateFlow(ctx:Message ,messageEntry: IParsedMessage) {
    ctx.amount = messageEntry.content;
    const month = Utilities.getMonth().toString(); // Convert month to string
    let acummulated = await this.googleSpreadsheetService.getAccumulatedByExpense(ctx.expenseTypeSelected, month);
    acummulated.length === 0 ? acummulated = [{expenseType: ctx.expenseTypeSelected, total: 0}] : acummulated;
    const accumlatedCurrent = Number(acummulated[0].total) + ctx.amount;
    const limit = ctx.limit;
    if(accumlatedCurrent > limit) {
      const message = `El monto acumulado de la partida ${ctx.expenseTypeSelected} es de S/. ${acummulated[0].total} más S/. ${ctx.amount} total de S/. ${accumlatedCurrent}, superando el límite de S/. ${limit}`;
      const template = this.builderTemplate.buildTextMessage(messageEntry.clientPhone,message);
      await this.senderService.sendMessages(template);
    }
    const clientPhone = messageEntry.clientPhone;
    const message = '¿Esta compra es de hoy?';
    const buttons = BTN_OPT_CURRENT_DATE
    const template = this.builderTemplate.buildInteractiveButtonMessage(clientPhone,message,buttons);
    await this.senderService.sendMessages(template);
    ctx.step = STEPS.DATE_SELECTED;
    await this.ctxService.updateCtx(ctx._id, ctx);
  }

  async getDifferentDateFlow(ctx:Message ,messageEntry: IParsedMessage) {
    const clientPhone = messageEntry.clientPhone;
    const message = 'Ingresa la fecha de la compra en formato DD/MM/AAAA';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    await this.senderService.sendMessages(template);
  }

  async confirmExpenseFlow(ctx:Message ,messageEntry: IParsedMessage) {
    if(messageEntry.content.id && messageEntry.content.id === BTN_ID.CURRENT_DATE) {
      ctx.registerDate = Utilities.today()
    } else {
      ctx.registerDate = messageEntry.content;
    }
    const clientPhone = messageEntry.clientPhone;
    const message = `¿Desear cargar a la partida ${ctx.expenseTypeSelected} el monto de S/. ${ctx.amount} con la descripción ${ctx.description} en la fecha ${ctx.registerDate}?`;
    const buttons = BTN_OPT_CONFIRM_GENERAL;
    const template = this.builderTemplate.buildInteractiveButtonMessage(clientPhone,message,buttons);
    await this.senderService.sendMessages(template);
    ctx.step = STEPS.CONFIRM_EXPENSE;
    await this.ctxService.updateCtx(ctx._id, ctx);
  }

  async createExpenseFlow(ctx:Message ,messageEntry: IParsedMessage) {
    const clientPhone = messageEntry.clientPhone;
    const expense = new Expense(ctx);
    await this.googleSpreadsheetService.insertData(0,expense);
    const message = 'Se ha registrado tu gasto con éxito';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    ctx.expenseTypeSelected = '';
    ctx.description = '';
    ctx.amount = 0;
    ctx.registerDate = '';
    ctx.step = STEPS.NEW_EXPENSE;
    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.senderService.sendMessages(template);

  }

  async resetExpenseFlow(ctx:Message ,messageEntry: IParsedMessage) {
    ctx.expenseTypeSelected = '';
    ctx.description = '';
    ctx.amount = 0;
    ctx.registerDate = '';
    ctx.step = STEPS.NEW_EXPENSE;
    await this.ctxService.updateCtx(ctx._id, ctx);
    const message = 'Se ha cancelado la operación';
    const template = this.builderTemplate.buildTextMessage(messageEntry.clientPhone,message);
    await this.senderService.sendMessages(template);
    await this.listExpensesFlow(ctx,messageEntry);
  }

  async cancelAppointmentFlow(ctx:Message ,messageEntry: IParsedMessage) {
    const clientPhone = messageEntry.clientPhone;
    const message = 'Lo siento, no es posible continuar con la operación';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    await this.senderService.sendMessages(template);
  }

  async notValidPaymentFlow(ctx:Message ,messageEntry: IParsedMessage) {
    if(ctx.attempts >= 3) {
      await this.cancelAppointmentFlow(ctx,messageEntry);
    }
    const clientPhone = messageEntry.clientPhone;
    const message = 'Lo siento, este no es un pago válido, sube una foto del comprobante de pago';
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    ctx.attempts = ctx.attempts + 1;
    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.senderService.sendMessages(template);
  }

   async NOT_VALID(ctx:Message ,messageEntry: IParsedMessage) {
    const clientPhone = messageEntry.clientPhone;
    const message = `Lo siento, no es un mensaje válido, intento de nuevo. Intento ${ctx.attempts}'`;
    const template = this.builderTemplate.buildTextMessage(clientPhone,message);
    ctx.attempts = ctx.attempts + 1;
    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.senderService.sendMessages(template);
  }


   async getWhatsappMediaUrl({ imageId }: { imageId: string }) {
    const getImage = await axios.get(
      `https://graph.facebook.com/v18.0/${imageId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      },
    )
    .then((res) => res.data)
    .catch((error) => console.error(error));
    
    return getImage.url;
  }


}
