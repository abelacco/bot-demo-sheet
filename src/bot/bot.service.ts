import { Injectable, Logger } from '@nestjs/common';
import { IParsedMessage } from './entities/messageParsed';
import { WspReceivedMessageDto } from 'src/common/dto';
import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from 'src/common/constants';
import { receivedMessageValidator } from './helpers/receivedMessageValidator';
import { FlowsService } from 'src/flows/flows.service';
import { CtxService } from 'src/context/ctx.service';


@Injectable()
export class BotService {

  constructor(
    private readonly flowsService: FlowsService,
    private readonly ctxService: CtxService,
  ) {

  }

  async proccessMessage(entryMessage: WspReceivedMessageDto) {
    // Deestructuración del mensaje de entrada
    Logger.log( `INIT PROCCESSMESSAGE  `, 'BOT SERVICE');
    const parsedMessage = await this.messageDestructurer(entryMessage);
    Logger.log( `PARSED MESSAGE  ${JSON.stringify(parsedMessage)} `, 'BOT SERVICE');
    //Si es otro tipo de mensaje 
    if(parsedMessage === 'OKNO') {
      Logger.log( `NO CLIENT MESSAGE`, 'BOT SERVICE');
      return 'OK'
    }
    //Busca mensaje por número de cliente
    const ctx = await this.ctxService.findOrCreateCtx(parsedMessage);
    Logger.log( `CTX  ${JSON.stringify(ctx)} `, 'BOT SERVICE');
    const action = receivedMessageValidator(ctx, parsedMessage);
    Logger.log( `THE ACTION IS: ${action} `, 'BOT SERVICE');
    if(action === 'NOT_VALID') {
      Logger.log( `ACTION NOT VALID`, 'BOT SERVICE');
      await this.flowsService[action](ctx,parsedMessage);
      return 'OK';
    } else {
       await this.flowsService[action](ctx,parsedMessage);
      Logger.log( `THE FLOW : ${action} WAS EXCUTED`, 'BOT SERVICE');
    }
    return 'OK';
  }

  private async messageDestructurer(messageDto: WspReceivedMessageDto) {
    const parsedMessage: IParsedMessage = {
      clientName: '',
      clientPhone: '',
      type: '',
      content: {}
  }
  // console.log( messageDto.entry[0].changes[0].value)
  if(messageDto.entry[0].changes[0].value?.statuses && messageDto.entry[0].changes[0].value?.statuses[0].status) {
    Logger.log('STATUS', messageDto.entry[0].changes[0].value?.statuses[0].status)
      return 'OKNO'
  }
  const contact = messageDto.entry[0].changes[0].value.contacts[0];
  const message = messageDto.entry[0].changes[0].value.messages[0];

  parsedMessage.clientName = contact.profile.name;
  parsedMessage.clientPhone = contact.wa_id.startsWith('52') ? contact.wa_id.replace('521', '52') : contact.wa_id;
  parsedMessage.type = message.type;
  // Falta agregar VIDEO y AUDIO
  // Falta agregar UNKNOW , EMOJIS , REACCIONES , STICKERS
  // Falta agregar LOCATION y CONTACT
  // Gestionar respuesta de estados del
  switch (message.type) {
    case WSP_MESSAGE_TYPES.INTERACTIVE:
      const interactiveType = message.interactive.type;
      if (interactiveType === INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY) {
        parsedMessage.content = {
          title: message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].title,
          id: message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].id,
        };
        
        break;
      } else if (interactiveType === INTERACTIVE_REPLIES_TYPES.LIST_REPLY) {
        parsedMessage.content = {
          title: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].title,
          id: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].id,
          description: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].description,
        };
      }
      break;
    case WSP_MESSAGE_TYPES.BUTTON:
      parsedMessage.content = {
        title: message.button.text,
        payload: message.button.payload,
      };
      
      break;
    case WSP_MESSAGE_TYPES.TEXT:
      parsedMessage.content = message.text.body;
      break;
    case WSP_MESSAGE_TYPES.IMAGE:
      parsedMessage.content = message.image.id
      break;
    default:
      return;
  }

  return parsedMessage;
  }



}
