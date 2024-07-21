import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: Schema.Types.ObjectId, // users who are subscribing
    ref: "User",
  },
  channel: {
    type: Schema.Types.ObjectId, //id of a user who is owner of channel
    ref: "User",
  },
});

const Subscription = new mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
