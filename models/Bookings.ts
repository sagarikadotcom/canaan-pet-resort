import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: true },
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, required: true },
  checkOutDate: { type: Date, required: true },
  checkOutTime: { type: String, required: true },
  dayBoarding: { type: Boolean, default: false },
  overnightBoarding: { type: Boolean, default: false },

  services: [
    {
      type: String,
      enum: ["boarding", "swimming", "grooming", "training"],
    },
  ],

  totalAmount: { type: Number, default: 0 },

  status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Rejected"], default: "Pending" },

  boardingStatus: {
    type: String,
    enum: ["CheckedIn", "CheckedOut", "PaymentPending"],
    default: "PaymentPending",
  },

}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
