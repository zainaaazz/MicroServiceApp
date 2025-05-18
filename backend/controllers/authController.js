// controllers/authController.js
require('dotenv').config();
const axios         = require('axios');
const jwt           = require('jsonwebtoken');
const { poolPromise } = require('../config/db');
const querystring   = require('querystring');
const bcrypt        = require('bcryptjs');
const logger        = require('../utils/logger');

const FRONTEND_URL  = process.env.FRONTEND_URL || 'http://localhost:3000';

// ————————————————————————————————————————————————————————————————————————
// In‐memory brute‐force protection
// ————————————————————————————————————————————————————————————————————————
const MAX_LOGIN_ATTEMPTS = 5;
// Map<user_id, { count: number }>
const loginAttempts = new Map();

// ————————————————————————————————————————————————————————————————————————
// Google OAuth endpoints
// ————————————————————————————————————————————————————————————————————————

exports.googleLoginURL = (req, res) => {
  const baseURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const opts = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id:    process.env.GOOGLE_CLIENT_ID,
    access_type:  'offline',
    response_type:'code',
    prompt:       'consent',
    scope:        ['profile','email'].join(' ')
  };
  res.redirect(`${baseURL}?${querystring.stringify(opts)}`);
};

exports.googleOAuthCallback = async (req, res) => {
  const code = req.query.code;
  try {
    // Exchange code for tokens
    const { data: tokenData } = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
        grant_type:    'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const access_token = tokenData.access_token;

    // Get Google user info
    const { data: googleUser } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const email = googleUser.email;
    const name  = googleUser.name;

    // Upsert into DB
    const pool = await poolPromise;
    let result = await pool.request()
      .input('email', email)
      .query('SELECT user_id, role_id, is_active FROM tblUsers WHERE email = @email');

    if (result.recordset.length === 0) {
      logger.info(`Auto‐registering new user ${email}`);
      await pool.request()
        .input('full_name',   name)
        .input('email',       email)
        .input('phone_number','0000000000')
        .input('city',        'Unknown')
        .input('province',    'Unknown')
        .input('zip_code',    '0000')
        .input('join_date',   new Date())
        .input('is_active',   1)
        .input('role_id',     1)
        .query(`
          INSERT INTO tblUsers
            (full_name,email,phone_number,city,province,zip_code,join_date,is_active,role_id)
          VALUES
            (@full_name,@email,@phone_number,@city,@province,@zip_code,@join_date,@is_active,@role_id)
        `);

      result = await pool.request()
        .input('email', email)
        .query('SELECT user_id, role_id, is_active FROM tblUsers WHERE email = @email');
    }

    const user = result.recordset[0];
    if (!user.is_active) {
      logger.warn(`Inactive Google login attempt for user_id ${user.user_id}`);
      return res.status(403).json({ error: 'User account is inactive' });
    }

    // Sign JWT
    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    logger.info(`Google login successful for user_id ${user.user_id}`);

    // Redirect back to front‐end
    res.redirect(`${FRONTEND_URL}/oauth2/redirect?token=${token}`);
  } catch (err) {
    logger.error('Google OAuth callback error', { message: err.message, stack: err.stack });
    res.status(500).send('OAuth login failed');
  }
};

// ————————————————————————————————————————————————————————————————————————
// Email/password login with brute‐force protection
// ————————————————————————————————————————————————————————————————————————

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('email', email)
      .query(`
        SELECT user_id, full_name, hashed_password, role_id, is_active
        FROM tblUsers
        WHERE email = @email
      `);

    // 1) Unregistered email
    if (result.recordset.length === 0) {
      logger.warn(`Unregistered email login attempt: ${email}`, { ip: req.ip });
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const user = result.recordset[0];

    // 2) Inactive account
    if (!user.is_active) {
      logger.warn(`Inactive account login attempt for user_id ${user.user_id}`);
      return res.status(403).json({ error: 'User account is inactive' });
    }

    // 3) Brute‐force check
    const attempts = loginAttempts.get(user.user_id) || { count: 0 };
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      logger.error(`Brute‐force lockout for user_id ${user.user_id}`);
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    // 4) Verify password
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      // bump their counter
      const newCount = attempts.count + 1;
      loginAttempts.set(user.user_id, { count: newCount });

      logger.warn(`Incorrect password attempt for user_id ${user.user_id}`, { ip: req.ip });

      // if they just hit the limit:
      if (newCount >= MAX_LOGIN_ATTEMPTS) {
        logger.warn(`Brute‐force lockout for user_id ${user.user_id}`);
        return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
      }

      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    // 5) Successful login → reset counter
    loginAttempts.delete(user.user_id);

    // 6) Sign JWT & respond
    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    logger.info(`Login success for user_id ${user.user_id}`);
    res.json({ token });

  } catch (err) {
    logger.error('login error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
