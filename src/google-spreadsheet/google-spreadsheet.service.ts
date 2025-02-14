import { Injectable, Logger } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Utilities } from 'src/context/helpers/utils';

@Injectable()
export class GoogleSpreadsheetService {
  private doc: GoogleSpreadsheet;
  private jwtClient: JWT;

  constructor() {
    const sheetId = process.env.GOOGLE_SHEET_ID;
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

    async getListAppointments(): Promise<any[]> {
      try{
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByIndex[0];
        const rows:any = await sheet.getRows();

        const list = rows.map(row => {
          return {
            registerDate: row._rawData[0], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            dateSelected: row._rawData[1], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            clientname: row._rawData[2], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            clientPhone: row._rawData[3], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            status: row._rawData[4], // Accede a la propiedad 'partida' utilizando la notación de corchetes
          };
        });
        // const prueba = Utilities.parseListAppointments(list);
        // console.log(prueba)
        return list;
      }
      catch (error) {
        console.error('Error al recuperar las citas:', error);
        throw new Error('Failed to retrieve appointments');
      }
    }

    async getListAppointmentsByDate(dateSelected: string, clientPhone: string): Promise<any[]> {
      try {
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByIndex[0];
        const rows: any = await sheet.getRows();
    
        // Filtra las filas que coinciden con dateSelected y clientPhone
        const filteredList = rows.filter(row => {
          return row._rawData[1].trim() === dateSelected && row._rawData[3].trim() === clientPhone;
        }).map(row => {
          return {
            registerDate: row._rawData[0],
            dateSelected: row._rawData[1],
            clientName: row._rawData[2],
            clientPhone: row._rawData[3],
            status: row._rawData[4],
          };
        });
    
        return filteredList;
      } catch (error) {
        console.error('Error al recuperar las citas:', error);
        throw new Error('Failed to retrieve appointments');
      }
    }

    /**
   * Actualiza el estado de una cita basada en la fecha seleccionada y el teléfono del cliente.
   * @param dateSelected La fecha de la cita a actualizar.
   * @param clientPhone El teléfono del cliente de la cita a actualizar.
   * @param newStatus El nuevo estado para la cita.
   */
  async updateAppointmentStatusByDateAndClientPhone(dateSelected: string, clientPhone: string, newStatus: string): Promise<void> {
    try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0]; // Asume que las citas están en la primera hoja
      const rows:any = await sheet.getRows();

      // Encuentra la fila específica que coincide con la fecha seleccionada y el teléfono del cliente
      const rowToUpdate = rows.find(row =>
        row._rawData[1].trim() === dateSelected.trim() &&
        row._rawData[3].trim() === clientPhone.trim()
      );

      if (rowToUpdate) {
        // Actualiza el estado en la fila encontrada
        rowToUpdate._rawData[4] = newStatus; // Asume que el nombre de la columna en tu hoja para el estado es "status"
        console.log(rowToUpdate._rawData);
        // Guarda los cambios en la hoja
        await rowToUpdate.save();
        console.log(`Estado actualizado para ${clientPhone} en la fecha ${dateSelected} a ${newStatus}.`);
      } else {
        console.log('No se encontró la cita para actualizar.');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
      throw new Error('Failed to update appointment status');
    }
  }
    

    async getProducts(): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByTitle['Principales']; // Accede a la hoja por su título
        if (!sheet) {
          throw new Error('La hoja de Partidas no se encuentra en el documento.');
        }
        const rows:any = await sheet.getRows(); // Obtiene todas las filas de la hoja 'Partidas'
    
        // Transforma las filas en un array de objetos con la información relevante
        const accounts = rows.map(row => {
          return {
            id: row._rawData[0], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            name: row._rawData[1], // Accede a la propiedad 'limite' utilizando la notación de corchetes,
            price: row._rawData[3], // Accede a la propiedad 'acumulado' utilizando la notación de corchetes,
            description: row._rawData[2], // Accede a la propiedad 'acumulado' utilizando la notación de corchetes,
            active: row._rawData[5], // Accede a la propiedad 'diferencia' utilizando la notación de corchetes,
            modifiers: row._rawData[7], // Accede a la propiedad 'diferencia' utilizando la notación de corchetes,
          };
        });
    
        return accounts;
      } catch (error) {
        console.error('Error al conectarse:', error.response?.data || error.message);
        throw new Error('Error al conectarse:');
      }
    }

    async getSubProducts(): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByTitle['Extras']; // Accede a la hoja por su título
        if (!sheet) {
          throw new Error('La hoja de Partidas no se encuentra en el documento.');
        }
        const rows:any = await sheet.getRows(); // Obtiene todas las filas de la hoja 'Partidas'
    
        // Transforma las filas en un array de objetos con la información relevante
        const accounts = rows.map(row => {
          return {
            id: row._rawData[0], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            name: row._rawData[1], // Accede a la propiedad 'limite' utilizando la notación de corchetes,
            price: row._rawData[3], // Accede a la propiedad 'acumulado' utilizando la notación de corchetes,
            description: row._rawData[2], // Accede a la propiedad 'acumulado' utilizando la notación de corchetes,
            active: row._rawData[5], // Accede a la propiedad 'diferencia' utilizando la notación de corchetes,
            modifiers: row._rawData[6], // Accede a la propiedad 'diferencia' utilizando la notación de corchetes,
          };
        });
    
        return accounts;
      } catch (error) {
        console.error('Error al conectarse:', error.response?.data || error.message);
        throw new Error('Error al conectarse:');
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
    
    async getAccounts(): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Carga la información de la hoja de cálculo
        const sheet = this.doc.sheetsByTitle['partidas']; // Accede a la hoja por su título
        if (!sheet) {
          throw new Error('La hoja de Partidas no se encuentra en el documento.');
        }
        const rows:any = await sheet.getRows(); // Obtiene todas las filas de la hoja 'Partidas'
    
        // Transforma las filas en un array de objetos con la información relevante
        const accounts = rows.map(row => {
          return {
            name: row._rawData[0], // Accede a la propiedad 'partida' utilizando la notación de corchetes
            limit: row._rawData[1], // Accede a la propiedad 'limite' utilizando la notación de corchetes,
            accumulated: row._rawData[2], // Accede a la propiedad 'acumulado' utilizando la notación de corchetes,
            difference: row._rawData[3], // Accede a la propiedad 'diferencia' utilizando la notación de corchetes,
          };
        });
    
        return accounts;
      } catch (error) {
        console.error('Error al recuperar las partidas con límites:', error);
        throw new Error('Failed to retrieve partidas with limits');
      }
    }

    async getSubAccounts(accountName:string): Promise<any[]> {
      try {
        await this.doc.loadInfo(); // Load the spreadsheet information
        const sheet = this.doc.sheetsByTitle['subpartidas']; // Access the sheet by its title
        if (!sheet) {
          throw new Error('The sheet "subcuentas" is not found in the document.');
        }
        const rows:any = await sheet.getRows(); // Get all rows from the "subcuentas" sheet
        
        // Transform the rows into an array of objects with the relevant information
        const subAccounts = rows.filter(row => row._rawData[0] === accountName).map(row => ({
          name: row._rawData[1].trim(), // Assuming this is the subpartida name
          limit: row._rawData[2], // Assuming this is the limit
          accumulated: row._rawData[3], // Assuming this is the accumulated value
          difference: row._rawData[4], // Assuming this is the difference
        }));
        
        return subAccounts;
      }
      catch (error) {
        console.error('Error retrieving the subaccounts:', error);
        throw new Error('Failed to retrieve subaccounts');
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

