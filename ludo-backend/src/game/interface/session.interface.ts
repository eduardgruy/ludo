import { Document } from 'mongoose';

export interface Session extends Document {
    readonly _id: string
    readonly socket: string
    }