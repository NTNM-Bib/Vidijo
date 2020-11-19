import Mongoose, { Schema } from 'mongoose'
import { IToken, ITokenModel } from '../interfaces/token.interface'

export const tokenSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  token: {
    type: String,
    required: true,
  },

  created: {
    type: Date,
    required: true,
    default: Date.now,
    //expires: 60 * 60 * 12  // seconds * minutes * hours
  },

  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
})

export const Token = Mongoose.model<IToken, ITokenModel>('Token', tokenSchema)
