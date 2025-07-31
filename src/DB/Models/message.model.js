import mongoose, { Schema } from "mongoose";



const messageSchema = new mongoose.Schema({
    body: { type: String, required: true, trim: true, minLength: 1, maxLength: 500 },
    sender: { type: Schema.Types.ObjectId, ref: "Users", required: true },
},{
    timestamps: true,
});

const messageModel = mongoose.model("Messages", messageSchema);
export default messageModel;