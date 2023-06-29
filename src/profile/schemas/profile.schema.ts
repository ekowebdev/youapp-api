import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Profile {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: false })
  name?: string;

  @Prop({ required: false })
  gender?: string;

  @Prop({ required: false })
  birthDate?: Date;

  @Prop({ required: false })
  horoscope?: string;

  @Prop({ required: false })
  zodiac?: string;

  @Prop({ required: false })
  height?: Number;

  @Prop({ required: false })
  weight?: Number;
  
  @Prop({ required: false })
  interests?: string[];

  @Prop({ required: false })
  image?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
