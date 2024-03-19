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
    const today = new Date();
    const date = '28/02/2024'
    return this.googleCalendarService.findAvailableSlots('abel3121@gmail.com', date);
    }
}
