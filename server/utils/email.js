import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
};

export const sendEmailOtp = async (email, otp) => {
    const mailTransporter = getTransporter();
    await mailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`
    })
}
