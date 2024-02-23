import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PAYMENTSTATUS, STEPS } from "../helpers/constants";

@Schema()
export class Message extends Document {

    @Prop({
    })
    accountSelected: string;

    @Prop({
    })
    subaccountSelected: string;

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
    limitAccount: number;

    @Prop({
    })
    limitSubaccount: number;
}



export const MessageSchema = SchemaFactory.createForClass(Message);
