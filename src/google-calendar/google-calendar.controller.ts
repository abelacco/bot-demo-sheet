import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';


@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}


  @Get('list-upcoming-events')
  async listUpcomingEvents(): Promise<any> {
    return this.googleCalendarService.listUpcomingEvents('abel3121@gmail.com');
  }

  @Get('find-available-slots')
  async findAvailableSlots(): Promise<any> {
    const date = '29/03/2024 15:00:00'
    return this.googleCalendarService.findAvailableSlots('abel3121@gmail.com', date);
    }

  @Post('create-event')
  async createEvent(@Body() body: any): Promise<any> {
    return this.googleCalendarService.createEventWithGoogleMeetAndNotifyAttendees('2024-04-03T10:00:00-05:00' ,'2024-04-03T11:00:00-05:00', 'abel3121@gmail.com', 'Test Event');
  }
}
