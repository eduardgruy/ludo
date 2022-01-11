import { Schema } from 'mongoose';

export const SessionSchema = new Schema({
    _id: String, //username
    socket: { type: String, index: true },
});

