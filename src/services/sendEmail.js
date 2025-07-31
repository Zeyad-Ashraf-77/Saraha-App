import nodemailer from "nodemailer";
export const sendEmail = async ({to,html,subject,text,attachments}) => {

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  port: 465,
  secure: true, // true for 465, false for other ports
  service: "gmail",
  auth: {
    user: "zeyadaltantawy365@gmail.com",
    pass: "klntcirgqakjaqfm",
  },
});

// Wrap in an async IIFE so we can use await.
  const info = await transporter.sendMail({
    from: `"Zeyad Altantawy" <zeyadaltantawy365@gmail.com>`,
    to: to||"zeyadaltantawy365@gmail.com",
    subject:subject || "Email confirmation ✔",
    text: text || "Confirm your email?", // plain‑text body
    html:html || "<a href = 'https://google.com' >Confirm your email</a>", // HTML body
    attachments: attachments ||[]
});

  console.log("Message sent:", info);
  if (info.accepted.length > 0) {
    return true
  }else{
    return false
  }

};