import e from 'express';
import { IParsedMessage } from '../entities/messageParsed';
import { WSP_MESSAGE_TYPES } from 'src/common/constants';
import { Message } from 'src/context/entities/message.entity';
import { BTN_ID, PACK_ID, STEPS } from 'src/context/helpers/constants';



// En esta función voy a recibir el paso en el que el carrito de compras se encuentra
// Si recibe que el carrito de compras esta en el paso init , entonces el mensaje que reciba debe ser de tipo texto
// Si recibe que el carrito de compras esta en el paso put_dni , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso insert_date , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso select_provider , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso select_payment , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso submit_voucher , entonces el mensaje que reciba debe ser de tipo image
export const receivedMessageValidator = (
  ctx: Message,
  entryMessage: IParsedMessage,
) => {
  let currentStep = ctx.step;
  if( typeof entryMessage.content === 'string' && entryMessage.content.toUpperCase() === 'RESET') {
    return 'cancelAppointmentFlow';
  }
  switch (currentStep) {
    case STEPS.INIT: // Respondo al primer saludo
      if (isTextMessage(entryMessage)) {
        // Debo llamar al servicio para responder
        return 'initFlow';
      }
      // debo llamar al servicio para responder que no es el mensaje esperado
      return 'NOT_VALID';
    case STEPS.EXPENSETYPE_SELECTED: // Estoy esperando que selecciones un tipo de gasto
      if (isInteractiveMessage(entryMessage)) {
        return 'getDescriptionFlow'
      }
      return 'NOT_VALID';
    case STEPS.DESCRIPTION_INSERTED: // Estoy esperando una confirmación de seguir con la compra
        if(isTextMessage(entryMessage)) {
          return 'getAmountFlow';
        }
        return 'NOT_VALID';
    case STEPS.AMOUNT_INSERTED: // Estoy esperando que ingreses o confirmes tu DNI
      if (isTextMessage(entryMessage)){
        return 'getDateFlow';
      
      }
        return 'NOT_VALID';
    case STEPS.DATE_SELECTED: // Estoy esperando que selecciones un paquete
      if (isInteractiveMessage(entryMessage)) {
        if(hasSpecificContentId(entryMessage,BTN_ID.CURRENT_DATE) ) {
          return 'confirmExpenseFlow';
        } 
        else {
          return 'getDifferentDateFlow';
        }
      } else if(isTextMessage(entryMessage)) {
        return 'confirmExpenseFlow';
      }
      return 'NOT_VALID';
    case STEPS.CONFIRM_EXPENSE:
      if(isInteractiveMessage(entryMessage)) {
        if(hasSpecificContentId(entryMessage,BTN_ID.CONFIRM_GENERAL) ) {
          return 'createExpenseFlow';
        }else {
          return 'resetExpenseFlow';
        }
      } else {
        return 'NOT_VALID';
      }  
    case STEPS.NEW_EXPENSE:
      if(isTextMessage(entryMessage)) {
        return 'listExpensesFlow';
      }
    default:
      return 'NOT_VALID';
  }
};


// export const isResetMessage = (infoMessage: IParsedMessage): boolean => infoMessage.content.id === ID.RESET;


export const isInteractiveMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE;

export const isButtonMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.BUTTON;

export const isTextMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type ===  WSP_MESSAGE_TYPES.TEXT;

export const isImageMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.IMAGE;

export const hasSpecificContentId = (infoMessage: IParsedMessage, expectedId: string): boolean =>  infoMessage.content.id === expectedId;

export const hasSpecificTitle = (infoMessage: IParsedMessage, expectedTitle: string): boolean => infoMessage.content.title.toUpperCase() === expectedTitle;









