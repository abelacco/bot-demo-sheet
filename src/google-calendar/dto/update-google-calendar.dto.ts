import { PartialType } from '@nestjs/swagger';
import { CreateGoogleCalendarDto } from './create-google-calendar.dto';

export class UpdateGoogleCalendarDto extends PartialType(CreateGoogleCalendarDto) {}
