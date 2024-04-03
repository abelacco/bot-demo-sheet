import { InteractiveListSection } from "src/builder-templates/interface";
import { MODALITY, PACK, PACK_ID, PLAN } from "./constants";
const moment = require('moment-timezone');
require('moment/locale/es'); // Importar la localización de español

moment.locale('es'); // Establecer español como idioma por defecto
export class Utilities {

    static findPlanDetails(pack_id: string, modality: string) {
        let planSelected = '';
        PACK.forEach(pack => {
            pack.rows.forEach(row => {
                if (row.id === pack_id) {
                    const planPrefix = pack_id.split('_')[0];
                    planSelected = PLAN[planPrefix].PLAN_NAME;
                }
            });
        });
        return planSelected;
    }

    static getPriceByPackId(pack_id) {
        // Iterar a través de los valores de PACK_ID para encontrar el objeto correspondiente
        for (const key of Object.keys(PACK_ID)) {
            if (PACK_ID[key].ID === pack_id) {
                return PACK_ID[key].precio; // Retornar el precio cuando se encuentre el ID coincidente
            }
        }
        return null; // Retornar null si no se encuentra el pack_id
    }

    static parseFullName(texto) {
        if (!texto) return texto; // Retorna el texto tal cual si es nulo o vacío

        // Convierte todo el texto a minúsculas y luego capitaliza la primera letra.
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    static getFirstName(fullName) {
        return this.parseFullName(fullName.split(' ')[0]);
    }

    // static today() {
    //     const today = new Date();
    //     const todayString = today.toLocaleDateString('es-PE');
    //     return todayString;
    // }

    static today(timeZone = 'America/Lima') {
        return moment().tz(timeZone).format('DD/MM/YYYY');
    }

    static addBusinessDays(dateTimeString, daysToAdd, timeZone = 'America/Lima') {
        // Asegurar que la fecha de entrada está en el formato esperado y en la zona horaria correcta
        let date = moment.tz(dateTimeString, 'DD/MM/YYYY', timeZone);

        while (daysToAdd > 0) {
            date = date.add(1, 'days');
            // Incrementar días solo si es un día laboral (lunes = 1, viernes = 5)
            if (date.isoWeekday() <= 5) {
                daysToAdd--;
            }
        }

        // Devuelve la fecha resultante en el mismo formato de entrada
        return date.format('DD/MM/YYYY');
    }

    static formatTime(time, format = 'HH:mm', timeZone = 'America/Lima') {
        return moment.tz(time, timeZone).format(format);
    }

    static getNextBusinessDay(dateTime, timeZone = 'America/Lima') {
        let nextDay = moment.tz(dateTime, timeZone).add(1, 'days');
        // Saltar fines de semana
        while (nextDay.isoWeekday() > 5) {
            nextDay.add(1, 'days');
        }
        return nextDay.format('DD-MM-YYYY');
    }

    static parseDate(dateString, format = 'DD-MM-YYYY', timeZone = 'America/Lima') {
        return moment.tz(dateString, format, timeZone);
    }

    static todayHour() {
        const today = moment.tz('America/Lima');
        // Combinación inusual pero solicitada: formato de 24 horas con AM/PM
        const todayString = today.format('DD/MM/YYYY hh:mm A');
        return todayString;
    }

    static getMonth() {
        const today = new Date();
        const month = today.getMonth() + 1; // getMonth() devuelve un valor de 0 a 11, por lo que se suma 1
        return String(month).padStart(2, '0'); // Asegura que el mes siempre tenga dos dígitos
    }

    static convertSchedule(schedule) {
        // Configurar moment en español
        moment.locale('es');
    
        // Convertir el día a formato "Viernes 29 de Abril"
        const convertedDay = moment(schedule.day, "YYYY-MM-DD").format('dddd D [de] MMMM');
    
        // Convertir las horas al formato de 12 horas con AM/PM
        const convertedHours = schedule.hours.map(hour => {
            return moment(hour, 'HH:mm').format('h:mm a');
        });
    
        // Construir el nuevo objeto con los valores convertidos
        const convertedSchedule = {
            day: convertedDay,
            hours: convertedHours
        };
    
        return convertedSchedule;
    }

    // static parseListAppointments(appointments:any) {
    //     moment.locale('es');
    //     const list = appointments.reduce((prev, current) => {
    //         const startDate = moment(current.date, "YYYY/MM/DD HH:mm:ss"); // Ajusta al formato de entrada si es necesario
    //         return prev += [
    //             `Espacio reservado (no disponible): `,
    //             `Desde ${startDate.format('dddd Do [de] MMMM YYYY, h:mm a')} `,
    //             `Hasta ${startDate.add(45, 'minutes').format('dddd Do [de] MMMM YYYY, h:mm a')} \n`,
    //         ].join('')
    //     }, '')
    //     return list;    
    // }
    static parseListAppointments(appointments) {
        moment.locale('es');  // Asegúrate de tener la localización en español para el formato de fecha.
        const appointmentsByDate = {};  // Un objeto para agrupar las citas por fecha.
    
        appointments.forEach((appointment) => {
            const startDate = moment(appointment.date, "YYYY/MM/DD HH:mm:ss");
            const endDate = moment(startDate).add(45, 'minutes');
            const dateKey = startDate.format('dddd D [de] MMMM YYYY');  // Clave para agrupar las citas.
    
            if (!appointmentsByDate[dateKey]) {
                appointmentsByDate[dateKey] = [];  // Inicializa la lista para esta fecha si aún no existe.
            }
    
            appointmentsByDate[dateKey].push(`${startDate.format('H:mm a')} - ${endDate.format('H:mm a')}`);
        });
    
        // Construye la cadena de salida final.
        let listOutput = "";
        for (const [date, times] of Object.entries(appointmentsByDate)) {
            listOutput += `${date}:\n${(times as string[]).join('\n')}\n`;
        }
    
        return listOutput;
    }

    static parseAvailableSpots(schedule: { day: string; hours: string[]; }) {
        if (!schedule.day) return 'El cliente no ha especificado un día ni hora de manera clara, preguntar para que día y hora desea tener la asesoría'; // Retorna un mensaje por defecto si no hay horarios
        // Parsear la fecha para obtener el día de la semana y la fecha en el formato deseado
        const date = moment(schedule.day, 'YYYY-MM-DD');
        const dayOfWeek = date.format('dddd'); // Obtiene el día de la semana, ej: 'viernes'
        const dayOfMonth = date.format('D'); // Obtiene el día del mes, ej: '29'
        const month = date.format('MMMM'); // Obtiene el mes, ej: 'marzo'
        const year = date.format('YYYY'); // Obtiene el año, ej: '2024'
      
        // Convertir el arreglo de horas a formato de 12 horas con AM/PM
        const hours = schedule.hours.map(hour => {
          // Parsear cada hora y convertirla a formato de 12 horas
          return moment(hour, 'HH:mm').format('hA'); // Convierte, ej: '15:00' a '3PM'
        });
      
        // Unir las horas con comas y reemplazar la última coma por 'y'
        const hoursText = hours.join(', ').replace(/, (?=[^,]*$)/, ' y ');
      
        // Construir y retornar la cadena final
        return `Para el día ${dayOfWeek} ${dayOfMonth} de ${month} del ${year} los horarios libres son ${hoursText.toLowerCase()}`;
      }
    
    static generateOneSectionTemplate(menuTitle:string, spots:any): InteractiveListSection[] {
            return [
                    {
                        title: menuTitle,
                        rows: spots.hours.map((hour: any, index: any) => ({
                            id: spots.day + hour,
                            title: spots.day,
                            description: hour,
                            // description: `Límite: ${item.limit}`,
                        })),
                    }
            ]
    }

    static isWithinBusinessHours(dateTimeString, timeZone = 'America/Lima') {
        if (!dateTimeString || dateTimeString.trim() === '') {
            return true;
        }
        // Determinar si la cadena de fecha y hora incluye una hora específica
        const hasTime = dateTimeString.includes(':');
    
        // Crear el objeto de momento con la fecha, hora (si está disponible) y zona horaria especificadas
        const format = hasTime ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY';
        const dateTime = moment.tz(dateTimeString, format, timeZone);
    
        // Obtener el día de la semana (lunes = 1, domingo = 7)
        const dayOfWeek = dateTime.isoWeekday();
    
        // Verificar si es un día laboral (lunes a viernes)
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
        if (!hasTime) {
            // Si no se ha proporcionado una hora, asumir que el día es válido si es un día laboral
            return isWeekday;
        }
    
        // Si se ha proporcionado una hora, verificar si está dentro del horario de atención
        const startTime = dateTime.clone().hour(9).minute(0).second(0);
        const endTime = dateTime.clone().hour(17).minute(0).second(0);
        const isWithinHours = dateTime.isSameOrAfter(startTime) && dateTime.isBefore(endTime);
    
        return isWeekday && isWithinHours;
    }

    static  validateBusinessInfo(info) {
        let missingFields = [];
    
        // Validar cada campo y agregar un mensaje apropiado si está vacío o es nulo
        if (!info.clientName) {
            missingFields.push("- Tu nombre");
        }
        if (!info.businessName) {
            missingFields.push("- El nombre de tu negocio");
        }
        if (!info.businessCategory) {
            missingFields.push("- La categoría de tu negocio");
        }
        if (!info.email) {
            missingFields.push("- Tu correo electrónico");
        } else if (!validateEmail(info.email)) {
            // Si el email no está vacío pero es inválido
            missingFields.push("- Tu correo electrónico no es correcto");
        }
    
        // Función auxiliar para validar el formato del email
        function validateEmail(email) {
            var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email.toLowerCase());
        }
    
        // Construir y devolver el mensaje final
        if (missingFields.length > 0) {
            return "Por favor, faltan los siguientes datos: " + missingFields.join(", ");
        } else {
            return "OK";
        }
    }
    

}


