import { Injectable } from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import {
  BTN_ID,
  BTN_OPT_CONFIRM_DNI,
  BTN_OPT_CONFIRM_GENERAL,
  BTN_OPT_CURRENT_DATE,
  BTN_OPT_PAYMENT,
  BTN_OPT_REPEAT,
  BTN_TITLE,
  MENU,
  NAME_TEMPLATES,
  PACK,
  PAYMENTSTATUS,
  STEPS,
} from 'src/context/helpers/constants';
import { Ctx } from 'src/context/entities/ctx.entity';
import { UserService } from 'src/user/user.service';
import { GeneralServicesService } from 'src/general-services/general-services.service';
import axios from 'axios';
import { IParsedMessage } from 'src/builder-templates/interface';
import { CtxService } from 'src/context/ctx.service';
import { SenderService } from 'src/sender/sender.service';
import { Utilities } from 'src/context/helpers/utils';
import { GoogleSpreadsheetService } from 'src/google-spreadsheet/google-spreadsheet.service';
import { Expense } from 'src/google-spreadsheet/entities';
import { UpdateCtxDto } from 'src/context/dto';
import { getFullCurrentDate } from 'src/bot/helpers/currentDate';
import { AiService } from 'src/ai/ai.service';
import { HistoryService } from 'src/history/history.service';
import { Product } from 'src/context/interface';

@Injectable()
export class FlowsService {
  constructor(
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly senderService: SenderService,
    private readonly aiService: AiService,
    private readonly googleSpreadsheetService: GoogleSpreadsheetService,
  ) {}

  // FECHA DE HOY: {CURRENT_DAY}
  // INIT: {INIT}

  // SOBRE "Tao Restobar":
  // Nos distinguimos por ofrecer una amplia variedad de platos internacionales, asegurando una experiencia culinaria única. Nuestro horario de atención es de lunes a domingo, desde las 12:00 hasta las 23:00. Para más información, visita nuestro sitio web en "saboresdelmundo.com". Aceptamos pagos en efectivo, tarjetas de crédito y a través de aplicaciones de pago móvil. Te recomendamos hacer una reserva para evitar tiempos de espera.

  // MENÚ DESTACADO:
  // ESPECIALES FRIOS
  // OMAKASE TAO339.00
  // 16 cortes de sashimis mixtos, 1/2 tabla de maki especial. 2 porc. de nigiris especiales, ceviche caliente y hosomaki.

  // TABLA PARA 4399.00
  // 16 cortes de sashimis mixtos, 3 porc. de nigiris especiales,1/2 tabla de maki especial, 6 intigyozas, 3 bolicausas, tempura mixta y 4 baos.

  // BARCO FUSION570.00
  // 36 cortes de sashimi mixto, 8 und de gunkan, 48 rolls, 8 und de nigiri, 2 und de hossomaki y 1 porción de tempura mixta.

  // SASHIMI & NIGIRI
  // SASHIMI MORIAWASE140.00
  // 16 CORTES La mejor elección del itamae, te sorprenderas

  // SASHIMI (3 cortes) MERO46.00 SALMÓN45.00 CONCHAS DE ABANICO36.00 ATÚN39.00 PULPO35.00
  // NIGIRIS CLÁSICOS (2 piezas) MERO24.00 SALMÓN24.00 CONCHAS DE ABANICO22.00 ATÚN22.00 PULPO25.00

  // GUNKAN & POKES
  // SALMÓN POKE58.00
  // Shari, cubos de salmón marinados en salsa spicy, ensalada ponja, cubos de palta, choclito dulce y nori crocante.

  // POKE AHUMADO48.00
  // Shari, tartare de atún tataki, ensalada de kiuri, palta, queso crema crocante, bañados en mayo shoyu y sriracha.

  // TNT GUNKAN SUSHI (2 piezas)
  // Bollos de arroz envueltos en bandos de nori, acompañados de shoyu, Gari y wasabi.

  //  SALMON30.00 HOTATE25.00 PULPO24.00 ATUN24.00

  // CEVICHES & CAUSAS
  // CAUSA CON TARTARE NIKKEI ATÚN51.00 MIXTO (Atún, Salmón)56.00
  // CEVICHE MIXTO O CLASICO64.00 MERO86.00
  // Clásica elaboración a base de pescado blanco, mixtura de mariscos, zumo de limón, cebolla, culantro, cancha, camote glaseado.

  // CEVICHE CARRETILLERO69.00
  // Con calle pero elegante, cubos de pescado blanco, rocoto con jugo de limon, chicharron de calamar.

  // CEVICAUSA52.00
  // Tradicional causa peruana, relleno con tartar de langostino y palta, sobre un clásico ceviche bien norteño.

  // CAUSA CARRETILLERA58.00
  // Con calle, pero elegante, rellena con langostino y palta, con chicharrón de calamar, acevichada de rocoto.

  // TIRADITOS TAO
  // TIRADITO TAKO PARRILLERO nuevo52.00
  // Pulpo grillado en una base de salsa de oliva ahumada, acompañado de tomate Cherry confitado, sufflé de arroz y coronado con chalaquita de rocoto.

  // TIRADITO CARRETILLERO54.00
  // Láminas de pescado blanco y leche de tigre amarillo ,chicharron de calamar , tartara asiatica y cubos de palta.

  // TIRADITO AHUMADO50.00
  // Láminas de pescado.blanco , bañados en leche de tigre ahumada de rocoto , pulpo al grill y chalaquita de zarandaja crocante.

  // TIRADITO FASSION65.00
  // Conchas de abanico XL selladas, Sobre espejo de leche de tigre de ají amarillo, coronado de palta, tobico negro, hojas de culantro, ají limo, cebolla roja, y gotas de aceite trufado.

  // TIRADITO TROPICAL65.00
  // Conchas de abanico XL selladas, en sopita de leche de tigre de coco, Coronado con palta, tobico negro, ovas de Salmón, hojas de culantro, aji limo, durazno ahumado, y aceite trufado.

  // NORITACOS TAO
  // (4 und.)
  // Galleta crocante de nori, rellena con una explosión de sabores.

  //  PULPO AL OLIVO60.00 ATÚN PICANTE56.00 SALMÓN AL SESAMO75.00 CONCHA ACV65.00 MEDIA PORCIÓN38.00

  // MAKIS TAO
  // SAMURAI ROLL40.00 MEDIO MAKI22.00
  // Relleno de ebi furai y palta. Coronado con un saltado de mariscos al curry y salsa tare.

  // MAKI DRAGÓN60.00 MEDIO MAKI35.00
  // Relleno de tartar de atún y ebi furai. Coronado en láminas de palta, acompañado de salsa de ají amarillo ahumado.

  // CARAQUEÑO40.00 MEDIO MAKI22.00
  // Relleno de plátano maduro, ebi furai y palta, coronado con una salsa de quesos gratinados y salsa tare.

  // OISHI ROLL60.00 MEDIO MAKI32.00
  // Langostino empanizado y palta por dentro, coronado con tartar de salmón, flameado con una emulsión de salsa de ajos picante.

  // NEW TAO45.00 MEDIO MAKI24.50
  // Relleno de pulpa de cangrejo, queso, palta y ebi furai, cubierta con pescado blanco ahumado bañado en salsa thai.

  // FUJI ROLL nuevo46.00 MEDIO MAKI25.00
  // Delicioso uramaki relleno de Ebi furai y queso crema con un toping de langostino crocante bañado en salsa fuji y tare.

  // HOTATE42.00 MEDIO MAKI23.00
  // Relleno de langostino , crocante y palta, fuera conchas de abanico flambeado con crema de ajo picante.

  // TAKO ACV45.00 MEDIO MAKI24.50
  // Relleno de langostino crocante y palta, cubierto con tartare de pulpo con salsa acevichada y olivo.

  // SMOKED AVOCADO48.00 MEDIO MAKI26.00
  // Relleno de pulpa de cangrejo, langostinos furai, cubierto con finas láminas de palta ahumadas bañadas en salsa de anguila.

  // TAO PIZZERO42.00 MEDIO MAKI23.00
  // Langostino crocante, cubierto de quesos gratinado, palta, bañado con salsa tare.

  // GAUCHO42.00 MEDIO MAKI23.00
  // Lomo furai, queso crema, cubierto con lomo flambeado y chimichurri.

  // PARRILLERO ROLL nuevo42.00 MEDIO MAKI23.00
  // Uramaki relleno de lomo furai, palta y pimiento ahumado, topeado con finas laminas de lomo y sopleteado con nuestra salsa parrillera.

  // SPICY44.00 MEDIO MAKI24.00
  // Relleno de atún fresco y palta, envueltos en nori, bañada en nuestra salsa picante.

  // TUNA ROCK44.00 MEDIO MAKI24.00
  // Relleno de langostino y palta, por fuera tartare de atún spicy con ponzu ahumada.

  // MAKIS CLÁSICOS
  // CALIFORNIA45.00 MEDIO MAKI24.50
  // Relleno de salmón fresco, queso crema, palta por fuera ajonjolí tostado.

  // ACEVICHADO42.00 MEDIO MAKI23.00
  // Langostinos crocantes, palta, cubierto con finos cortes de atún, bañados en nuestra deliciosa salsa acevichado y con topin de Furikake criollo.

  // EXTRAVAGANZA42.00 MEDIO MAKI23.00
  // Queso crema, ebi furai, cubierto en salmón flambeado con salsa batayaki y bañado con salsa tare.

  // TARTAR ROLL nuevo44.00 MEDIO MAKI24.00
  // Delicioso maki crocante relleno con Ebi furai y palta con toping de tartar golf coronado con hilos crocantes.

  // BABY42.00 MEDIO MAKI23.00
  // Relleno de Eby Furai y palta, cubierto de finas láminas de pescado blanco, bañado con salsa spicy garlic, flambeada y salsa tare.

  // CERVEZAS
  // HEINEKEN14.00

  // JUGOS
  // Limonada vaso12.00 Jarra de 1lt25.00
  // Fruta vaso15.00 Jarra de 1lt28.00
  // Especial Tao vaso18.00 Jarra de 1lt28.00
  // Frozzen vaso18.00 Jarra de 1lt30.00
  // Por favor complete la siguiente encuesta

  // HISTORIAL DE CONVERSACIÓN:
  // --------------
  // {HISTORIAL_CONVERSACION}
  // --------------

  // DIRECTRICES DE INTERACCIÓN:
  // 1. Proporciona información detallada y precisa sobre los platos cuando se solicite , no inventar nada solo responder según  la información que te proporcionamos.
  // 2. Anima a los clientes a realizar pedidos directamente a través de este chat.
  // 3. Confirma los detalles del pedido para asegurar la satisfacción del cliente antes de finalizar.
  // 4. Si INIT es 1, considera que ya hemos saludado al cliente anteriormente y procede directamente con la consulta o servicio.

  // EJEMPLOS DE RESPUESTAS:
  // "¡Claro! ¿Te gustaría ordenar algo de nuestro menú destacado o necesitas recomendaciones?"
  // "Estoy aquí para ayudarte a realizar tu pedido, ¿qué te gustaría probar hoy?"
  // "¿Puedo interesarte en alguno de nuestros platos especiales del día o prefieres algo más tradicional?"

  // INSTRUCCIONES:
  // - Respuestas cortas ideales para enviar por WhatsApp con emojis.
  // - No inventar platos ni ingredientes.
  // - Si INIT es 1, omite el saludo inicial para evitar repetición y procede directamente con la asistencia.

  // Respuesta útil:`;
  PROMPT_SELLER = `	
    Bienvenido a "LaBurger Lima", tu destino para auténticas hamburguesas al carbón en el distrito de Surquillo. Nos encontramos en el corazón de Lima, en Av. Principal 501, Surquillo. Soy tu Asistente Virtual, listo para ayudarte en lo que necesites. 
    
    FECHA DE HOY: {CURRENT_DAY}
    INIT: {INIT}

    SOBRE "LaBurger Lima":
    En LaBurger Lima, nos enorgullecemos de ofrecer hamburguesas hechas a la perfección al carbón, utilizando sólo carne de res 100% natural para proporcionarte una experiencia culinaria excepcional. Estamos abiertos todos los días desde las 7:00 PM hasta las 11:00 PM. Si necesitas más información o deseas realizar un pedido, no dudes en llamarnos al 934504415 durante nuestro horario de atención o visitarnos en nuestra dirección en Av. Principal 501, Surquillo, Lima. Aceptamos efectivo , todo las tarjetas , yape o plin.
    
    MENÚ COMPLETO:

    HAMBURGUESAS:
    - Burger Doble (2 carnes de 130 gr): S/.17.9
    - Burger Royal (con huevo frito): S/.14.9
    - Burger a lo pobre (con plátano frito): S/.16.9
    - Burger Hawaiana (con Piña, queso y jamón): S/.16.9
    - Burger Bacon (con Tocino ahumado): S/.15.9
    - Burger Caramel / Cheddar (con cebollas caramelizadas y queso Cheddar): S/.15.9
    - Burger Argentina (con chorizo parrillero): S/.17.9
    - Burger Clásica (con papas al hilo, lechuga y tomate): S/.13.9
    - Burger Cheese (con Queso Edam o Cheddar): S/.14.9
    - Burger Deluxe (con 4 toppings a elección, no incluye chorizo/carne extra): S/.18.9
    
    ADICIONALES O TOPPINGS (Solo para hamburguesas y otros):
    - Jamón: S/.2
    - Filete de pollo Extra: S/.6
    - Tocino: S/.3
    - Queso Edam: S/.2
    - Queso Cheddar: S/.2
    - Plátano frito: S/.2
    - Piña: S/.2
    - Huevo: S/.2
    - Carne extra: S/.5
    - Chorizo: S/.5
    - Cebolla Caramelizada: S/.2
    
    BEBIDAS:
    - Agua San Carlos (500ml): S/.2
    - Sprite (500ml): S/.5
    - Shandy (Cerveza Lager y bebida gasificada): S/.7
    - Coca Cola Zero (300ml): S/.4
    - Inca Kola (500ml): S/.5
    - Pepsi (355ml): S/.2.5
    - 7 Up (355ml): S/.1
    - Fanta (500ml): S/.5
    - Inca Kola Zero (300ml): S/.4
    - Guarana (330ml): S/.2.5
    - Concordia Piña (355ml): S/.2.5
    
    OTROS:
    - Salchipapa Deluxe (con 3 toppings a elección): S/.18.9
    - Filete de Pollo a la parrilla: S/.14.9
    - Papas fritas Crocantes (150 gr): S/.6
    - Camote frito: S/.6
    - Salchipapa con Queso y Tocino: S/.17.9
    - Salchipapa Frankfuter: S/.14.9
    - Choripan con Chimichurri: S/.10.9
    - Salchipapa con Queso Cheddar: S/.15.9
    - Combo papas fritas + Gaseosa PepsiCo: S/.6
    - Combo camote frito + Gaseosa PepsiCo: S/.6
    
    CREMAS DISPONIBLES:
    - Ketchup
    - Mayonesa
    - Mostaza
    - Ají
    - Aceituna
    - Rocoto

    HISTORIAL DE CONVERSACIÓN:
    --------------
    {HISTORIAL_CONVERSACION}
    --------------
    
    DIRECTRICES DE INTERACCIÓN:
    1. Proporciona información detallada y precisa sobre nuestros platos cuando se solicite.
    2. Anima a los clientes a realizar sus pedidos directamente a través de este chat.
    3. Confirma los detalles del pedido con el cliente para asegurar su total satisfacción.
    4. Si INIT es 1, omite el saludo inicial para evitar repeticiones y procede directamente con la consulta o servicio requerido.
    5. Cuando saludes siempre di el nombre del restaurante y además dejas indicando que le dejas un link de la carta.

    EJEMPLOS DE RESPUESTAS:
    "Bienvenido a LaBurger Lima, ¿te gustaría ordenar alguna de nuestras hamburguesas destacadas o necesitas alguna recomendación?"
    "¡Por supuesto! ¿Te gustaría ordenar alguna de nuestras hamburguesas destacadas o necesitas alguna recomendación?"
    "Estoy aquí para ayudarte con tu pedido, ¿qué te gustaría probar hoy?"
    " Para terminar con tu orden necesito tu nombre y dirección de entrega por favor"
    "¿Te interesa probar nuestra Hamburguesa Especial de la Casa o prefieres algo más tradicional como nuestra Hamburguesa Clásica?"
    
    INSTRUCCIONES:
    - Utiliza respuestas cortas y claras, ideales para enviar por WhatsApp.
    - En lo posible agregar emojis al mensaje.
    - Mantén las respuestas basadas en el menú y la información proporcionada.
    - Si INIT es 1, evita el saludo inicial para no ser repetitivo y ofrece directamente la asistencia.
    `;

  generatePromptSeller = (history: string) => {
    let init = '0';
    if (history.includes('Vendedor')) {
      init = '1';
    }
    const nowDate = getFullCurrentDate();
    return this.PROMPT_SELLER.replace('{HISTORIAL_CONVERSACION}', history)
      .replace('{CURRENT_DAY}', nowDate)
      .replace('{INIT}', init);
  };

  async INFO(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const prompt = this.generatePromptSeller(historyParsed);
      console.log('PROMPT:', prompt);
      const text = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);

      const chunks = text.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
        );
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

//   PROMPT_GET_PRODUCTS = `
//   Basado en el historial de la conversación proporcionada y nuestra lista de productos disponibles, tu tarea es identificar y extraer las menciones finales de productos y adicionales realizadas por el cliente, organizándolos en grupos según su relación en el pedido. Considera que algunos productos pueden ser parte de un combo o tener adicionales especificados por el cliente.
//   Historial de la Conversación:
//   {CONVERSATION_HISTORY}

//   Lista de Productos Disponibles:
//   {PRODUCT_LIST}

//   Instrucciones:
//   1. Analiza detalladamente la conversación proporcionada para identificar todas las menciones de productos finales, incluyendo los platos principales, adicionales, toppings y cremas.
//   2. Compara las menciones finales encontradas con la lista de productos disponibles que hemos proporcionado.
//   3. Crea un array con los nombres de los productos y adicionales exactos según aparecen en nuestra lista de productos disponibles cuando encuentres una coincidencia.
//   4. Si un producto mencionado por el cliente se encuentra en nuestra lista, inclúyelo en el array con el nombre exacto registrado en la base de datos.
//   5. El array debe reflejar solo los productos y adicionales finales confirmados en la conversación, asegurándote de que cada elemento coincida con un producto de nuestra base de datos.
//   6. Agrupa los productos , sus adicionales y cremas según cómo el cliente los ha confirmado en su pedido.
//   7. Los productos iguales pero no relacionados directamente deben listarse por separado.

//   Ejemplo de Formato de Respuesta Esperado (solo el array):
//   [
//     [
//         "Burger Deluxe"
//     ],
//     [
//         "Burger Deluxe"
//     ],
//     [
//         "Burger Clasica",
//         "Adic, Chorizo*",
//         "Adic, Plátano frito"
//     ],
//     [
//         "Pepsi"
//     ],
//     [
//         "Pepsi"
//     ]
// ]
//   Asegúrate de que el array final sea una representación precisa de la última conversación con el cliente, utilizando los nombres reales de los productos y adicionales tal como están registrados en nuestra base de datos.
//   `;
PROMPT_GET_PRODUCTS=`Basándonos en la siguiente conversación entre un cliente y un vendedor, y considerando nuestra carta de menú detallada, tu tarea es identificar y listar todos los productos finales mencionados por el cliente, asegurándote de corregir y adaptar cualquier mención a los nombres exactos de los productos tal como aparecen en nuestra carta. Si en caso no exista el producto mencionado por el cliente entonces este no agregarlo a la respuesta.Considera los cambios realizados durante la conversación, como adiciones o eliminaciones de productos.
Historial de la Conversación:
--------------
{CONVERSATION_HISTORY}
--------------
 MENÚ COMPLETO:
--------------
HAMBURGUESAS:
    - Burger Doble (2 carnes de 130 gr): S/.17.9
    - Burger Royal (con huevo frito): S/.14.9
    - Burger a lo pobre (con plátano frito): S/.16.9
    - Burger Hawaiana (con Piña, queso y jamón): S/.16.9
    - Burger Bacon (con Tocino ahumado): S/.15.9
    - Burger Caramel / Cheddar (con cebollas caramelizadas y queso Cheddar): S/.15.9
    - Burger Argentina (con chorizo parrillero): S/.17.9
    - Burger Clásica (con papas al hilo, lechuga y tomate): S/.13.9
    - Burger Cheese (con Queso Edam o Cheddar): S/.14.9
    - Burger Deluxe (con 4 toppings a elección, no incluye chorizo/carne extra): S/.18.9
    
    ADICIONALES (Solo para hamburguesas y otros):
    - Jamón: S/.2
    - Filete de pollo Extra: S/.6
    - Tocino: S/.3
    - Queso Edam: S/.2
    - Queso Cheddar: S/.2
    - Plátano frito: S/.2
    - Piña: S/.2
    - Huevo: S/.2
    - Carne extra: S/.5
    - Chorizo: S/.5
    - Cebolla Caramelizada: S/.2
    
    BEBIDAS:
    - Agua San Carlos (500ml): S/.2
    - Sprite (500ml): S/.5
    - Shandy (Cerveza Lager y bebida gasificada): S/.7
    - Coca Cola Zero (300ml): S/.4
    - Inca Kola (500ml): S/.5
    - Pepsi (355ml): S/.2.5
    - 7 Up (355ml): S/.1
    - Fanta (500ml): S/.5
    - Inca Kola Zero (300ml): S/.4
    - Guarana (330ml): S/.2.5
    - Concordia Piña (355ml): S/.2.5
    
    OTROS:
    - Salchipapa Deluxe (con 3 toppings a elección): S/.18.9
    - Filete de Pollo a la parrilla: S/.14.9
    - Papas fritas Crocantes (150 gr): S/.6
    - Camote frito: S/.6
    - Salchipapa con Queso y Tocino: S/.17.9
    - Salchipapa Frankfuter: S/.14.9
    - Choripan con Chimichurri: S/.10.9
    - Salchipapa con Queso Cheddar: S/.15.9
    - Combo papas fritas + Gaseosa PepsiCo: S/.6
    - Combo camote frito + Gaseosa PepsiCo: S/.6
    
    CREMAS DISPONIBLES:
    - Ketchup
    - Mayonesa
    - Mostaza
    - Ají
    - Aceituna
    - Rocoto
--------------

 INSTRUCCIONES:

-Extracción y Verificación: Analiza cuidadosamente la conversación entre el cliente y el vendedor. Identifica los productos mencionados y verifica cada uno contra nuestra carta de menú detallada.
-Filtrado de Productos: Incluye en el array final únicamente aquellos productos que coinciden exactamente con los ítems disponibles en nuestra carta. Los productos que no estén en la carta NO deben ser agregados al array.
-Detalles del Pedido: Para los productos que sí se encuentran en la carta, lista su nombre exacto como aparece en el menú, la cantidad solicitada y cualquier especificación adicional mencionada por el cliente.
-Organización del Pedido: Presenta la información de manera ordenada y clara, reflejando el pedido actualizado del cliente según la conversación, pero solo incluyendo los productos que se validaron como parte de la carta.
-Confirmación Final: Revisa que cada ítem incluido en el array final realmente exista en la carta del menú y corresponda a las especificaciones del cliente.

Nota Adicional: Asegúrate de revisar cada pedido contra la carta para confirmar la disponibilidad antes de incluir cualquier producto en el array final. Este enfoque garantiza que solo los productos válidos y confirmados se reflejen en el pedido finalizado.


EJEMPLO RESPUESTA:
[
    {
        "producto": "Burger Deluxe",
        "cantidad": 1,
        "adicionales": [],
        "notas": []
    },
    {
        "producto": "Papas fritas Crocantes",
        "cantidad": 1,
        "adicionales": [],
        "notas": []
    },
    {
        "producto": "Burger Clásica",
        "cantidad": 1,
        "adicionales": ["Mayonesa"],
        "notas": [ ]
    }
]
EJEMPLO SIN PRODUCTOS
 [ ]
`
  generatePromptGetProducts = (history: string, productsDB: any) => {
    let productsDbParsed = JSON.stringify(productsDB);
    return this.PROMPT_GET_PRODUCTS.replace(
      '{CONVERSATION_HISTORY}',
      history,
    ).replace('{PRODUCT_LIST}', productsDbParsed);
  };

  PROMPT_BUILD_ORDER = `
  Basado en el historial de la conversación proporcionada y la lista de productos seleccionados por el cliente, tu tarea es crear un array de objetos que represente el pedido final de manera precisa. Cada objeto debe seguir nuestra estructura estándar para un producto ordenado, completando las propiedades conocidas basadas en la información proporcionada y dejando vacías aquellas que sean desconocidas.

  Glosario:
  - Producto: Cualquier ítem que el cliente puede ordenar directamente.
  - Adicional/Topping: Ingredientes o ítems que se añaden a un producto principal, identificados en las menciones de la conversación.
  - Combo: Un paquete de productos ofrecidos a un precio especial, que puede incluir el producto principal junto con varios adicionales o toppings específicos.
  Historial de la Conversación:
  {CONVERSATION_HISTORY}
  
  Productos Seleccionados (validados de la base de datos):
  {VALIDATED_PRODUCTS}

  Instrucciones Detalladas:
  1. Examina la información proporcionada en la conversación y los productos seleccionados para determinar los detalles finales del pedido, incluyendo la cantidad de cada producto y los adicionales mencionados.
  2. Establece la 'quantity' y 'subtotal' para cada producto basándote en la conversación; asume 1 como cantidad predeterminada si no se especifica.
  3. Identifica los 'toppings' y 'sauce' mencionados para cada producto. Asigna como 'toppings' aquellos adicionales mencionados que aumentan el precio.
  4. Para los productos clasificados como 'combo', utiliza el nombre del producto como 'name' y lista los productos o toppings que se mencionan como incluidos en la propiedad 'combo', basándote en la descripción del producto. Si los toppings son parte de la descripción del combo incluido, estos deben ser clasificados en 'combo', no en 'toppings', y no deben incrementar el precio del combo.
  5. Deja cualquier propiedad desconocida o no mencionada como vacía.
  
  Ejemplo de Estructura de Pedido para el Array Final:
  [
      {
          "id": "1070",
          "name": "Burger Deluxe",
          "price": 18.9,
          "quantity": 1,
          "subtotal": 18.9,
          "description": "Burger c/4 toppings a elección incluidos",
          "notes": "Adicional de chorizo",
          "active": true,
          "toppings": [],
          "sauce": [],
          "combo": [{"name": "Jamón"}, {"name": "Filete de pollo Extra"}, {"name": "Tocino"}, {"name": "Queso Cheddar"}]
      },
      {
          "name": "Burger Simple con Huevo",
          "price": [determinar según base de datos si disponible],
          "quantity": 1,
          "subtotal": [calcular basado en precio y adicionales],
          "description": "Burger simple con adicional de huevo",
          "notes": "",
          "active": [determinar si activo según base de datos],
          "toppings": [{"name": "Huevo", "price": [precio del huevo si es adicional]}],
          "sauce": [],
          "combo": []
      }
      // Añade más objetos según cada producto en el pedido.
  ]
  
  Recuerda detallar el pedido final del cliente utilizando la información proporcionada y siguiendo las especificaciones de la estructura del producto.
 `;
  
  generatePromptBuildOrder = (history: string, validProducts: any) => {
    let validProductsParsed = JSON.stringify(validProducts);
    return this.PROMPT_BUILD_ORDER.replace(
      '{CONVERSATION_HISTORY}',
      history,
    ).replace('{VALIDATED_PRODUCTS}', validProductsParsed);
  };

  async ORDER(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const productsDB = await this.googleSpreadsheetService.getProducts();
      // debo determinar si el producto existe en el menu de la db
      // si existe debo retornar el precio y la descripcion del producto
      // si no existe debo retornar un mensaje de error
      const prompt = this.generatePromptGetProducts(historyParsed, productsDB);
      console.log('PROMPT:', prompt);
      const text = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      const validProducts = JSON.parse(text);
      console.log('VALID PRODUCTS:', validProducts);
      const arrayValidProduct = await this.findAndProcessProducts(
        validProducts,
        productsDB,
        historyParsed,
      );
      console.log('ARRAY VALID PRODUCTS:', arrayValidProduct);
      // const findValidProducts = productsDB.filter(product => {
      //   return arrayValidProduct.includes(product.name);
      // })
      // console.log('FIND VALID PRODUCTS:', findValidProducts);
      const promptBuildOrder = this.generatePromptBuildOrder(historyParsed, arrayValidProduct);
      console.log('PROMPT BUILD ORDER:', promptBuildOrder);
      const textBuildOrder = await this.aiService.createChat([
        {
          role: 'system',
          content: promptBuildOrder,
        },
      ]);
      console.log('TEXT BUILD ORDER:', textBuildOrder);
      const order = JSON.parse(textBuildOrder);
      console.log('ORDER:', order);
      const message = await this.buildOrderMessage(order);
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            message,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            message,
          ),
        );
      // const chunks = text.split(/(?<!\d)\.\s+/g);
      // for (const chunk of chunks) {
      //   const newMessage =
      //     await this.historyService.setAndCreateAssitantMessage(
      //       messageEntry,
      //       chunk,
      //     );
      //   await this.senderService.sendMessages(
      //     this.builderTemplate.buildTextMessage(
      //       messageEntry.clientPhone,
      //       chunk,
      //     ),
      //   );
      // }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async findAndProcessProducts(orderList, productList, historyParsed) {
    let productsValidated = [];
    let finalOrder = [];
    for (let orders of orderList) {
      for (let orderItem of orders) {
        // Find the first product that matches the order item
        let product = productList.find((product) =>
          product.name.toLowerCase().includes(orderItem.toLowerCase()),
        );

        if (product) {
          productsValidated.push(product); // Add product to results
          // await prompt(product); // Wait for the 'prompt' function to complete before continuing
        }
      }
      // const promptBuildOrder = this.generatePromptBuildOrder(
      //   historyParsed,
      //   productsValidated,
      // );
      // console.log('PROMPT BUILD ORDER:', promptBuildOrder);
      // const textBuildOrder = await this.aiService.createChat([
      //   {
      //     role: 'system',
      //     content: promptBuildOrder,
      //   },
      // ]);
      // console.log('TEXT BUILD ORDER:', textBuildOrder);
      // const order = JSON.parse(textBuildOrder);
      // console.log('ORDER:', order);
      // finalOrder.push(order);
      // productsValidated = [];
    }
    return productsValidated;
  }

  async  buildOrderMessage(orderArray) {
    let message = "🍔 Tu pedido en LaBurger Lima:\n\n";
    let totalOrder = 0;

    orderArray.forEach(item => {
        message += `${item.quantity}x ${item.name} - S/.${item.price}\n`;
        if (item.combo.length > 0) {
            message += "   Combo incluye:\n";
            item.combo.forEach(comboItem => {
                message += `   - ${comboItem.name}\n`; // Asumimos que los combos no modifican el precio
            });
        }
        if (item.toppings.length > 0) {
            message += "   Adicionales:\n";
            item.toppings.forEach(topping => {
                message += `   - ${topping.name}: S/.${topping.price}\n`;
                item.subtotal += parseFloat(topping.price); // Asegúrate de que price es un número
            });
        }
        if (item.sauce.length > 0) {
            message += "   Salsas:\n";
            item.sauce.forEach(sauce => {
                message += `   - ${sauce.name}\n`; // Suponiendo que las salsas son gratis o ya están incluidas en el precio
            });
        }
        if (item.notes) {
            message += `   Notas: ${item.notes}\n`;
        }
        message += `   Subtotal: S/.${item.subtotal.toFixed(2)}\n\n`; // Asegura dos decimales en el subtotal
        totalOrder += item.subtotal; // Suma al total del pedido
    });

    message += `Total del pedido: S/.${totalOrder.toFixed(2)}`; // Total del pedido con dos decimales
    return message;
}

  async ADDRESS(ctx: Ctx, messageEntry: IParsedMessage) {}

  async PAYMENT(ctx: Ctx, messageEntry: IParsedMessage) {}

  async getWhatsappMediaUrl({ imageId }: { imageId: string }) {
    const getImage = await axios
      .get(`https://graph.facebook.com/v19.0/${imageId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      })
      .then((res) => res.data)
      .catch((error) => console.error(error));

    return getImage.url;
  }
}
