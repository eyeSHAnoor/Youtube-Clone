import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

playListSchema.plugin(mongooseAggregatePaginate);

const PlayList = mongoose.model("PlayList", playListSchema);
export default PlayList;
