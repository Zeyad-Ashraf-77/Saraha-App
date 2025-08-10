
import { EventEmitter } from "events";
import { createToken } from "../token/index.js";
import { sendEmail } from "../../services/sendEmail.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
 console.log(data);
 const { email } = data;
     const token = await createToken({payload:{ email },SecretKey:process.env.CONFIRM_TOKEN,options :{ expiresIn: "5m" }} );

    const link = `http://localhost:3000/auth/confirm/${token}`;

    const isSend = await sendEmail({
      to: email,
      html: `<a href='${link}'>Confirm your email</a>`,
    });
    if (!isSend) {
      return res.status(500).json({ message: "Error sending email" });
    }
 
}); 


