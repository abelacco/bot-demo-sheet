import { InteractiveListSection } from "src/builder-templates/interface";
import { MODALITY, PACK, PACK_ID, PLAN } from "./constants";
const moment = require('moment-timezone');
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

    static today() {
        const today = moment.tz('America/Lima');
        const todayString = today.format('DD/MM/YYYY');
        return todayString;
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
    
    static generateOneSectionTemplate(menuTitle:string, items:any): InteractiveListSection[] {
            return [
                    {
                            title: menuTitle,
                            rows: items.map((item:any, index:any) => ({
                                id: `${index}`,
                                title: item.name,
                                // description: `Acumulado: ${item.accumulated} Límite: ${item.limit} Disponible: ${item.difference}`,
                            })),
                    }
            ]
        }

}


