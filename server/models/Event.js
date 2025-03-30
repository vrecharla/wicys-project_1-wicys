import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    flyerPath: { type: String, default: "" },
    photos: [{ type: String }],
    registrationLink: { type: String },
    isUpcoming: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;