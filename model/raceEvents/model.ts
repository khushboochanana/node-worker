import mongoose, { Schema } from 'mongoose'

const raceEventsSchems = new Schema({
  event: String,
  horse: { id: String, name: String },
  time: Number
})

const raceEvents = mongoose.model('raceEvents', raceEventsSchems)

export default raceEvents
