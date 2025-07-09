// backend/controllers/otpController
const otpModel = require('../services/otpModel'); 
const speakeasy = require('speakeasy'); 
const qrcode = require('qrcode'); 
const bcrypt = require('bcrypt'); 
const { sendOtpEmail } = require('../utils/emailService');
const { User, Otp} = require('../db/models');
const crypto = require('crypto');

// ******************************* email 
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999); // Générer un code OTP à 6 chiffres
  return otp;
};
//router.post('/otp/generate-otp', sendOtp);
const sendOtp = async (req, res) => {
  //Extracts email from req.body
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email requis.' });
  }
  //Generates an OTP
  const otp = generateOtp();
  //Hashes the OTP using bcrypt for secure storage.
  const hashedOtp = await bcrypt.hash(otp.toString(), 10); 
  console.log("OTP generated at:", new Date());

  try {
    //Sends the OTP via email 
    await sendOtpEmail(email, otp);
    
    //Stores the email, hashed OTP, and flags (verified: false) in the database (Otp table)
    await Otp.create({
      email,
      otp:hashedOtp, 
      secret: null,
      verified: false
    });
    
    res.status(200).json({ message: 'OTP envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi ou du stockage de l\'OTP:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
//router.post('/verifyOtp', verifyOtp);
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log("Received OTP request with email:", email);
  console.log("Received OTP:", otp);

  try {
    // 1. Chercher le dernier OTP pour cet email
    const otpRecord = await Otp.findOne({
      where: { email: email },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found.' });
    }

    // 2. Vérifier que l'OTP correspond
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 3. Marquer l'OTP comme vérifié
    otpRecord.verified = true;
    await otpRecord.save();

    // 4. Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }


    // DELETE the OTP from the database
    await otpModel.deleteOtp(email);

    return res.status(200).json({ message: 'OTP verified and deleted successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ******************************* qr code
//router.get('/generate-secret', authenticateToken, generateSecret);
const generateTotpSecret = async (req, res) => {
  const { email } = req.user; // assuming you're using auth middleware

  const secret = speakeasy.generateSecret({
    name: `Teamwill (${email})`
  });

  try {
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store secret in your DB (hashing optional depending on security model)
    await Otp.create({
      email,
      otp: null,
      secret: secret.base32,
      verified: false,
    });

    console.log("Génération du secret TOTP pour:", email);
    console.log("Secret (base32):", secret.base32);

    return res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la génération du QR code' });
  }
};
//router.post('/verifyTotp', authenticateToken, verifyTotp);
const verifyTotp = async (req, res) => {
  const email = req.user?.email;
  const { otp } = req.body; 
  
  if (!email) {
    return res.status(401).json({ message: "Email de l'utilisateur non trouvé dans le token." });
  }
  try {
    // Retrieve the latest OTP secret for the user
    const otpRecord = await Otp.findOne({
      where: { email },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord || !otpRecord.secret) {
      return res.status(400).json({ message: 'Aucun secret TOTP trouvé pour cet utilisateur.' });
    }

    console.log("Vérification du TOTP pour:", email);
    console.log("Token reçu:", otp);
    console.log("Dernier secret en base32 depuis la BD:", otpRecord?.secret);

    // Verify the OTP with speakeasy
    const verified = speakeasy.totp.verify({
      secret: otpRecord.secret,
      encoding: 'base32',
      token: otp, 
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Code TOTP invalide.' });
    }
    console.log("Résultat de la vérification TOTP:", verified);

    otpRecord.verified = true;
    await otpRecord.save(); // Update the OTP record to mark it as verified
    await otpModel.deleteOtp(email); // Clean up the OTP record

    return res.status(200).json({ message: 'TOTP vérifié avec succès' });
  } catch (err) {
    console.error('Erreur lors de la vérification TOTP:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { 
  sendOtp ,
  verifyOtp, 
  generateTotpSecret,
  verifyTotp
};