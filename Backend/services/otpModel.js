// services/otpModels.js
const { Otp } = require('../db/models');

// ************************ email
// Deletes the OTP record for the given email from the databas
const deleteOtp = async (email) => {
  console.log("Deleting OTP for email:", email); // Log when OTP is deleted
  await Otp.destroy({ where: { email } });
};


// ************************ qr code:
//Retrieves the stored secret from the database.
const getSecretForUser = async (email) => {
  const otpEntry = await Otp.findOne({
    where: { email },
    attributes: ['secret'],
    order: [['created_at', 'DESC']],  // 🆕 get the latest
  });
  return otpEntry ? otpEntry.secret : null;
};




module.exports = {
  deleteOtp,
  getSecretForUser
};