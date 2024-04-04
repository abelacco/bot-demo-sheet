import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Product } from "../interface";

@Schema()
export class Ctx extends Document {

    @Prop()
    chatbotNumber: string;
    
    @Prop()
    clientname: string;
  
    @Prop()
    clientPhone: string;

    @Prop()
    parsedAvailableHours: string;
  
    @Prop()
    order: Product[];
  
    @Prop()
    quantity: number;
  
    @Prop()
    totalCost: number;
  
    @Prop()
    address: string;
  
    @Prop()
    lat: string;
  
    @Prop()
    lng: string;
  
    @Prop()
    deliveryCost: number;
  
    @Prop()
    total: number;
  
    @Prop()
    paymentMethod: string;
  
    @Prop()
    date: Date;
  
    @Prop()
    status: string;
  
    @Prop()
    step: string;

    @Prop()
    dateSelected: string;

    @Prop()
    email: string;
  
    @Prop()
    attempts: number;
}



export const CtxSchema = SchemaFactory.createForClass(Ctx);
