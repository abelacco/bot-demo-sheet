import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import * as moment from 'moment-timezone';
import { Utilities } from 'src/context/helpers/utils';

@Injectable()
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private jwtClient: JWT;

  constructor() {
    this.jwtClient = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.jwtClient as any });
  }

  /**
   * Lista los próximos eventos de un calendario específico.
   * 
   * @param calendarId ID del calendario de Google para buscar eventos.
   * @param maxResults Número máximo de eventos a devolver.
   */
  async listUpcomingEvents(calendarId: string, maxResults: number = 10): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: (new Date()).toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error al listar eventos de Google Calendar:', error);
      throw new Error('Failed to list events from Google Calendar');
    }
  }

  /**
   * Encuentra los horarios disponibles en un calendario específico.
   * Esta es una función simplificada, puedes personalizarla según tus necesidades.
   * 
   * @param calendarId ID del calendario de Google para buscar eventos disponibles.
   */

  async findAvailableSlots(calendarId: string = 'abel3121@gmail.com', dateString: string): Promise<{day:string,hours: string[] }> {
    const date = moment(dateString, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const timeZone = 'America/Lima';
    const format = 'HH:mm';
    const timeMin = moment.tz(date + 'T09:00:00', timeZone);
    const timeMax = moment.tz(date + 'T17:00:00', timeZone);
    const now = moment.tz(timeZone); 
    const todayDate = now.format('YYYY-MM-DD');
  
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response.data.items || [];
      const availableSlots = [];
      let currentTime = moment(timeMin);
  
      console.log(`Now: ${now.toString()}`);
  
      while (currentTime < timeMax) {
        const endTime = moment(currentTime).add(60, 'minutes');
  
        console.log(`Checking slot: ${currentTime.format(format)} to ${endTime.format(format)}`);
  
        // Si estamos consultando el día actual, y la hora final del intervalo ya ha pasado, saltar al siguiente intervalo.
        if (date === todayDate && now.isSameOrAfter(currentTime, 'minute')) {
          console.log(`Slot ${currentTime.format(format)} to ${endTime.format(format)} has passed.`);
          currentTime.add(60, 'minutes');
          continue;
        }
  
        const isSlotAvailable = events.every(event => {
          const eventStart = moment.tz(event.start.dateTime || event.start.date, timeZone);
          const eventEnd = moment.tz(event.end.dateTime || event.end.date, timeZone);
          return endTime.isSameOrBefore(eventStart) || currentTime.isSameOrAfter(eventEnd);
        });
  
        if (isSlotAvailable) {
          availableSlots.push(currentTime.format(format));
        }
  
        currentTime.add(60, 'minutes');
      }

      return {
        day: date,
        hours: availableSlots,
      };
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw new Error('Failed to find available slots');
    }
  }
}
