'use strict';

import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

const POSITIONS = ['BUY', 'SELL'];
const CURRENCIES = ['BTC'];

var OfferSchema = new mongoose.Schema({
  info: String,
  position: { type: String, enum: POSITIONS },
  currency: { type: String, enum: CURRENCIES },
  amount: {
    type: Number,
    min: 0,
    default: 0
  },
  location: {
    lat: {
      type: Number,
      min: -90,
      max: 90,
      default: null
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
      default: null
    },
    radius: { // Eli: In meters
      type: Number,
      min: 0,
      default: 100
    }
  },
  userId: mongoose.Schema.Types.ObjectId,
  active: {
    type: Boolean,
    default: true
  }
});

OfferSchema.plugin(timestamps);
export default mongoose.model('Offer', OfferSchema);
