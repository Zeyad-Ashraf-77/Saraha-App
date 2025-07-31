import checkConnection from "./DB/ConnectionDB.js";
import authRouter from "./Modules/auth/auth.controller.js";
import userRouter from "./Modules/Users/user.controller.js";

export const bootstrap = async (app, express) => {
  const Port = process.env.PORT || 3000;
  app.use(express.json());
  await checkConnection();
  app.use("/auth",authRouter);
  app.use("/users",userRouter);



   app.use("{/*demo}",(req,res,next)=>{
    return res.status(404).json({message: `url not found ${req.originalUrl}`,statusCode:404})
   })
  
  app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
  });
};
