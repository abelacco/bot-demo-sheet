import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

@Injectable()
export class GoogleSpreadsheetService {
  private doc: GoogleSpreadsheet;
  private jwtClient: JWT;

  constructor() {
    const sheetId = '1j_nBJZs1XOwju0GcJ1Ad0L5nWojuVN-n7oZOUZmR3zg';
    if (!sheetId) {
      throw new Error('Sheet ID is required');
    }
    this.jwtClient = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ]
      
    });

    this.doc = new GoogleSpreadsheet(sheetId, this.jwtClient); // Pass the auth argument
  }

    /**
   * Inserta datos en una hoja específica dentro de la hoja de cálculo.
   * 
   * @param sheetIndex Índice de la hoja donde se insertarán los datos (basado en 0).
   * @param rowData Datos a insertar en la hoja. Debe ser un objeto donde las claves corresponden a los encabezados de las columnas.
   */
    async insertData(sheetIndex: number, rowData: any): Promise<void> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByIndex[sheetIndex]; // Obtiene la hoja por índice
        // const headers = await sheet.loadHeaderRow();
        // console.log('Headers:', headers);
        // Inserta la fila en la hoja
        await sheet.addRow(rowData);
      } catch (error) {
        console.error('Error al insertar datos en Google Sheets:', error);
        throw new Error('Failed to insert data into Google Sheets');
      }
    }


    async getAvailableDay(): Promise<string> {
      try {
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByIndex[0];
        const rows: any = await sheet.getRows();
    
        const shiftsByDate = {};
        rows.forEach(row => {
          const fecha = row._rawData[1]; // Asume que esta es la fecha en formato DD/MM/YYYY
          if (shiftsByDate[fecha]) {
            shiftsByDate[fecha].push(row);
          } else {
            shiftsByDate[fecha] = [row];
          }
        });
    
        const sortedDates = Object.keys(shiftsByDate).sort((a, b) => {
          const [dayA, monthA, yearA] = a.split("/").map(Number);
          const [dayB, monthB, yearB] = b.split("/").map(Number);
          return new Date(yearA, monthA - 1, dayA).valueOf() - new Date(yearB, monthB - 1, dayB).valueOf();
        });
    
        let nextAvailableDate = sortedDates.find(date => shiftsByDate[date].length < 4);
    
        if (!nextAvailableDate && sortedDates.length > 0) {
          // Calcula manualmente el próximo día disponible basado en la última fecha de sortedDates
          const [lastDay, lastMonth, lastYear] = sortedDates[sortedDates.length - 1].split("/").map(Number);
          let nextDay = new Date(lastYear, lastMonth - 1, lastDay + 1); // Añade un día a la última fecha registrada
          const dd = String(nextDay.getDate()).padStart(2, '0');
          const mm = String(nextDay.getMonth() + 1).padStart(2, '0'); //Enero es 0
          const yyyy = nextDay.getFullYear();
          nextAvailableDate = `${dd}/${mm}/${yyyy}`;
        }
    
        // Si todas las fechas están llenas o no hay fechas registradas, asigna el día actual como disponible
        if (!nextAvailableDate) {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
          const yyyy = today.getFullYear();
          nextAvailableDate = `${dd}/${mm}/${yyyy}`;
        }
    
        return nextAvailableDate;
      } catch (error) {
        console.error('Error retrieving the next available day:', error);
        throw new Error('Failed to retrieve the next available day');
      }
    }
    
    async getExpenseTypeWithLimits(): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByTitle['partidas']; // Accede a la hoja por su título
        if (!sheet) {
          throw new Error('La hoja de Partidas no se encuentra en el documento.');
        }
        const rows:any = await sheet.getRows(); // Obtiene todas las filas de la hoja 'Partidas'
    
        // Transforma las filas en un array de objetos con la información relevante
        const partidasWithLimits = rows.map(row => {
          console.log(row._rawData);
          return {
            expenseType: row._rawData[0], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            limit: row._rawData[1], // Accede a la propiedad 'limite' utilizando la notación de corchetes
          };
        });
    
        return partidasWithLimits;
      } catch (error) {
        console.error('Error al recuperar las partidas con límites:', error);
        throw new Error('Failed to retrieve partidas with limits');
      }
    }

    async getAccumulatedByExpense( expenseType:string,month: string, year:string ='24'): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByTitle['egresos']; // Reemplaza con el título real de tu hoja
        const rows:any = await sheet.getRows(); // Obtiene todas las filas de la hoja
    
        const filteredRows = rows.filter(row => {
          const fechaEgreso = row._rawData[1]; // Asume que esta es la fecha en formato DD/MM/YYYY         
          const [day, monthRow, yearRow] = fechaEgreso.split('/').map(String);
          const matchesExpenses = expenseType ? row._rawData[2] === expenseType : true;
          return monthRow === month && yearRow === year && matchesExpenses;
        });
        console.log(filteredRows);
        const accumulatedByPartida = filteredRows.reduce((acc, row) => {
          const expenseType = row._rawData[2];
          const total = parseFloat(row._rawData[4]) || 0; // Asegúrate de convertir el total a número
    
          if (!acc[expenseType]) {
            acc[expenseType] = { expenseType, total: 0 };
          }
    
          acc[expenseType].total += total;
          return acc;
        }, {});
    
        // Convertir el objeto acumulado a un array de objetos
        return Object.values(accumulatedByPartida);
      } catch (error) {
        console.error('Error al recuperar los acumulados por partida:', error);
        throw new Error('Failed to retrieve accumulated by partida');
      }
    }

    async getUser(phoneNumber: string): Promise<{name: string, phoneNumber: string} | null> {
      try {
        await this.doc.loadInfo(); // Load the spreadsheet information
        const sheet = this.doc.sheetsByTitle['colab']; // Access the sheet by its title
        if (!sheet) {
          throw new Error('The sheet "colab" is not found in the document.');
        }
        const rows:any = await sheet.getRows(); // Get all rows from the "colab" sheet
        
        // Find the row with the matching phone number
        const matchingRow = rows.find(row => row._rawData[1] === phoneNumber);
        
        if (matchingRow) {
          // If a matching row is found, return the name and phoneNumber
          return {
            name: matchingRow._rawData[0], // Assuming 'nombre' is the column name for names
            phoneNumber: matchingRow._rawData[1] // Assuming 'celular' is the column name for phone numbers
          };
        }
        
        return null; // Return null if no matching row is found
      } catch (error) {
        console.error('Error searching for the phone number in Google Sheets:', error);
        throw new Error('Failed to search for the phone number in Google Sheets');
      }
    }
    
    
    
    
}

