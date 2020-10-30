import { Document, Model } from "mongoose";

interface ITokenDocument extends Document {
  user: any;
  token: string;
  created: Date;
  isVerified: boolean;
}

export interface IToken extends ITokenDocument {}

export interface ITokenModel extends Model<IToken> {}
