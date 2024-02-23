import { PartialType } from '@nestjs/swagger';
import { CreateGoogleSpreadsheetDto } from './create-google-spreadsheet.dto';

export class UpdateGoogleSpreadsheetDto extends PartialType(CreateGoogleSpreadsheetDto) {}
