require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Token options
  options: {
    issuer: 'the-local-loop',
    audience: 'the-local-loop-users'
  }
};

