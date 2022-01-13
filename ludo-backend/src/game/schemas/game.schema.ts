import { Schema } from 'mongoose';

export const GameSchema = new Schema({
    status: { type: String, default: "open" },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    players: {
        type: [{
            username: String,
            color: String
        }], index: true
    },
    winner: String,
    lastRoll: Number, 
    doubleRoll: Boolean,
    turn: String,
    action: String,
    event: String,
    positions: {
        type: {
            green: [{
                name: String,
                position: String
            }],
            red: [{
                name: String,
                position: String
            }],
            blue: [{
                name: String,
                position: String
            }],
            yellow: [{
                name: String,
                position: String
            }]
        }
    },
    movable: [String]
});

