import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { calendar } from 'googleapis/build/src/apis/calendar';


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
    return this.googleCalendarService.createEventWithGoogleMeetAndNotifyAttendees('2024-04-08T10:00:00-05:00' ,'2024-04-08T11:00:00-05:00', 'abel3121@gmail.com', 'Test Event');
  }

  @Get('find-event-byId')
  async findEvent(@Query('calendarId') calendarId: string, @Query('eventId') eventId: string): Promise<any> {

    return this.googleCalendarService.findEventById(calendarId, eventId);
  }

  @Get('cancel-event')
  async cancelEvent(@Query('calendarId') calendarId: string, @Query('eventId') eventId: string): Promise<any> {
    return this.googleCalendarService.findAndCancelEvent(calendarId, eventId);
  }
}