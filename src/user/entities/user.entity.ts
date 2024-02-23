import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @ApiProperty()
  @Prop({
    type: String,
  })
  name: string;

  @ApiProperty()
  @Prop({
    unique: true,
    type: String,
  })
  phone: string;

  @ApiProperty()
  @Prop({
    type: String,
  })
  dni: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
