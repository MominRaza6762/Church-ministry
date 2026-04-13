import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || ""
  }
});

export const sendMail = async ({ to, subject, text, html }) => {
  const opts = {
    from: process.env.EMAIL_USER || "",
    to,
    subject,
    text: text || "",
    html: html || ""
  };
  await transporter.sendMail(opts);
};