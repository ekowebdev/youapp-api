import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ unique: [true, 'Username already exists'], required: [true] })
  username: string;

  @Prop({ unique: [true, 'Email already exists'], required: [true] })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: false,
    alias: 'profile'
  })
  profileId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: 'profileId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
