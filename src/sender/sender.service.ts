import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SenderService {
  async sendMessages(messageClient: any) {
    Logger.log(`Mensaje a enviar ${JSON.stringify(messageClient)}`, 'SENDER SERVICE');
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_ID}/messages`, messageClient,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
          },
        },
      );
      Logger.log(`STATUS ${response.status}`, 'SENDER SERVICE');

    } catch (error) {
      Logger.error(`Mensaje: ${error.response.data.error.message}`, 'SENDER SERVICE');
      Logger.error(`Detalle: ${error.response.data.error.error_data.details}`, 'SENDER SERVICE');
      throw new Error(error.response.data.error.message);
    }
  }
}
