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
}
