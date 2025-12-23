const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'KarimAlineRama';
const JWT_EXPIRE = process.env.JWT_EXPIRE || 7;

exports.sign = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
