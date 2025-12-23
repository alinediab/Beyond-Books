const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.user = decoded; // { id, role }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
