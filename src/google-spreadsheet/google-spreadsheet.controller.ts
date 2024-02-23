import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GoogleSpreadsheetService } from './google-spreadsheet.service';

@Controller('google-spreadsheet')
export class GoogleSpreadsheetController {
  constructor(private readonly googleSpreadsheetService: GoogleSpreadsheetService) {}

  @Post('insert')
  insertData(@Body() data: any) {
    return this.googleSpreadsheetService.insertData(data.sheetIndex, data.rowData);
  }

  @Get('availableday')
  getAvailableDay() {
    return this.googleSpreadsheetService.getAvailableDay();
  }

  @Get('expensetype')
  getPartidas() {
    return this.googleSpreadsheetService.getExpenseTypeWithLimits();
  }

  @Get('user/:phone')
  getUser(@Param('phone') phone: string) {
    return this.googleSpreadsheetService.getUser(phone);
  }

  @Get('/accumulated')
  async getAccumulatedByExpense(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('expenseType') partida?: string
  ): Promise<any[]> {
    if (!month) {
      throw new Error('Month and year are required');
    }
    return this.googleSpreadsheetService.getAccumulatedByExpense(month, year, partida);
  }
  
}
  