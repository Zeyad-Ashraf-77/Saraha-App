import nodemailer from "nodemailer";
export const sendEmail = async ({to,html,subject,text,attachments}) => {


const transporter = nodemailer.createTransport({
  port: 465,
  secure: true, 
  service: "gmail",
  auth: {
    user: process.env.SEND_EMAIL,
    pass: process.env.SEND_EMAIL_PASSWORD,
  },
});

  const info = await transporter.sendMail({
    from: `"Zeyad Altantawy" <${process.env.SEND_EMAIL}>`,
    to: to||"zeyadaltantawy365@gmail.com",
    subject:subject || "Email confirmation ✔",
    text: text || "Confirm your email?", 
    html:html || "<a href = 'https://google.com' >Confirm your email</a>", 
    attachments: attachments ||[]
});

  console.log("Message sent:", info);
  if (info.accepted.length > 0) {
    return true  
  }else{
    return false
  }

};