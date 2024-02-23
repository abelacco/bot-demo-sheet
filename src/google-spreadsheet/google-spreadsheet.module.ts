import { Module } from '@nestjs/common';
import { GoogleSpreadsheetService } from './google-spreadsheet.service';
import { GoogleSpreadsheetController } from './google-spreadsheet.controller';

@Module({
  controllers: [GoogleSpreadsheetController],
  providers: [GoogleSpreadsheetService],
  exports: [GoogleSpreadsheetService],
})
export class GoogleSpreadsheetModule {}
