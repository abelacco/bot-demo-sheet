import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PAYMENTSTATUS, STEPS } from "../helpers/constants";

@Schema()
export class Message extends Document {

    @Prop({
    })
    expenseTypeSelected: string;

    @Prop({
    })
    registerDate: string;

    @Prop({
    })
    workername: string;

    @Prop({
    })
    workerPhone: string;

    @Prop({
    })
    description: string;

    @Prop({
    })
    amount: number;



    @Prop({
        type: String,
        enum: STEPS,
        default: STEPS.INIT
    })
    step: string;


    @Prop({
        default: 0
    })
    attempts: number;

    @Prop({
    })
    limit: number;

}



export const MessageSchema = SchemaFactory.createForClass(Message);
