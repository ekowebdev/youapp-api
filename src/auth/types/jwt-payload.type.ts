import { ObjectId } from "mongoose";

export type JwtPayload = {
  _id: number;
  username: string;
  email: string;
};
