import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

export const Counter = mongoose.model('counters', CounterSchema);
