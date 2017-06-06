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
    default: 0
  },
  location: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    radius: { // Eli: In meters
      type: Number,
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
