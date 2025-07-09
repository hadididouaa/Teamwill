//backend/ utils/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

module.exports = async function authenticateToken(req, res, next) {
  
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Token manquant ou invalide (cookie).' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    req.user = user;
    //req.user = { email: decoded.email }; // ⚠️ C’est ce champ qui est utilisé dans generateSecret
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Échec d\'authentification.', error: err.message });
  }
};

