const nodemailer = require('nodemailer');

// Initialize the transporter once and reuse it
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER,  // Your email (use environment variables for sensitive data)
        pass: process.env.EMAIL_PASS   // Your email password or app-specific password
    }
});

// Method to send OTP email
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,  
        to: email,                   
        subject: 'Votre OTP de vérification', 
        text: `Bonjour, voici votre OTP : ${otp}. Il est valable pendant 1 minute.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

// Method to send account creation email
const sendAccountEmail = async ({ email, username, password }) => {
    const loginUrl = `${process.env.FRONTEND_URL}/signin`; 

    const mailOptions = {
        from: process.env.EMAIL_USER,  
        to: email,                   
        subject: 'Votre compte a été créé', 
        html: `
            <h3>Bonjour ${username},</h3>
            <p>Un compte a été créé pour vous sur notre plateforme.</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe temporaire :</strong> ${password}</p>
            <p>Vous avez <strong>24h</strong> pour vous connecter. Après cela, votre compte sera désactivé.</p>
            <p><a href="${loginUrl}">Cliquez ici pour vous connecter</a></p>
        `  
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Account creation email sent successfully');
    } catch (error) {
        console.error('Error sending account creation email:', error);
        throw new Error('Failed to send account creation email');
    }
};


const sendTemporaryPasswordEmail = async (to, tempPassword) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Mot de passe temporaire - Teamwill',
      html: `
        <p>Bonjour,</p>
        <p>Voici votre mot de passe temporaire :</p>
        <h2>${tempPassword}</h2>
        <p>Utilisez-le pour vous connecter et le changer immédiatement.</p>
        <p>Ce mot de passe est valide pour une courte durée.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  
module.exports = { sendOtpEmail, sendAccountEmail,sendTemporaryPasswordEmail };
