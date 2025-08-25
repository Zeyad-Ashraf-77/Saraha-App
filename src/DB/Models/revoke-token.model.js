import mongoose, { Schema } from "mongoose";



const revokeTokenSchema = new mongoose.Schema({
    token:{type:String,required:true,trim:true},
    expiresAt:{type:String,required:true},
    
},{
    timestamps: true, 
});

const revokeTokenModel = mongoose.model("RevokeToken",revokeTokenSchema);
export default revokeTokenModel;