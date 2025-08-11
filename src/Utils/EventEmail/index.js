
import { EventEmitter } from "events";
import { createToken } from "../token/index.js";
import { sendEmail } from "../../services/sendEmail.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
 console.log(data);
 const { email ,otp} = data;
     const token = await createToken({payload:{ email },SecretKey:process.env.CONFIRM_TOKEN,options :{ expiresIn: "5m" }} );

    const link = `http://localhost:3000/auth/confirm/${token}`; 

    const isSend = await sendEmail({
      to: email,
      html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كود التحقق (OTP)</title>
<style>
    body {
        margin: 0;
        font-family: "Segoe UI", Tahoma, Arial, sans-serif;
        background: linear-gradient(135deg, #6c63ff, #00c2ff);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: #333;
    }
    .otp-card {
        background: #fff;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgb(58, 240, 13);
        text-align: center;
        max-width: 350px;
        width: 100%;
    }
    .otp-card h1 {
        font-size: 20px;
        margin-bottom: 12px;
    }
    .otp-card p {
        font-size: 14px;
        color: #666;
        margin-bottom: 20px;
    }
    .otp-code {
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 8px;
        padding: 12px;
        border-radius: 8px;
        background:rgb(245, 227, 34);
        display: inline-block;
        margin-bottom: 20px;
        box-shadow: 0 8px 25px rgba(245, 227, 34, 0.7);
    }
    .note {
        font-size: 12px;
        color: #888;
    }
</style>
</head>
<body>

<div class="otp-card">
    <h1>كود التحقق الخاص بك</h1>
    <p>استخدم الكود التالي لإتمام عملية التحقق:</p>
    <div class="otp-code">${otp}</div> 
    <div class="note">هذا الكود صالح لمدة 5 دقائق فقط.</div>
</div>

</body>
</html>
`,
    });
    if (!isSend) {
      return res.status(500).json({ message: "Error sending email" });
    }
 
}); 


