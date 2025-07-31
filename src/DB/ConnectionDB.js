import mongoose from "mongoose";

 const checkConnection = async ()=> {
 await mongoose.connect(process.env.URI)
 .then(() => {
     console.log("Connected to MongoDB");
 }) .catch((err) => {
     console.error("Failed to connect to MongoDB", err);
 });

 }
 export default checkConnection;