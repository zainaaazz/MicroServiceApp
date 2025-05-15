const axios = require('axios');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');
const querystring = require('querystring');

exports.googleLoginURL = (req, res) => {
  const baseURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['profile', 'email'].join(' ')
  };

  const authURL = `${baseURL}?${querystring.stringify(options)}`;
  res.redirect(authURL);
};

exports.googleOAuthCallback = async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Exchange code for access token
    const { data: tokenData } = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const access_token = tokenData.access_token;

    // 2. Get user info from Google
    const { data: googleUser } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const email = googleUser.email;
    const name = googleUser.name;

    const pool = await poolPromise;

    // 3. Check if user exists
    let result = await pool.request()
      .input('email', email)
      .query('SELECT user_id, role_id, is_active FROM tblUsers WHERE email = @email');

    let user;

    if (result.recordset.length === 0) {
      // Optional: Auto-register new users (for dev/testing only)
      console.log(`Auto-registering new user: ${email}`);

      await pool.request()
        .input('full_name', name)
        .input('email', email)
        .input('phone_number', '0000000000')
        .input('city', 'Unknown')
        .input('province', 'Unknown')
        .input('zip_code', '0000')
        .input('join_date', new Date())
        .input('is_active', 1)
        .input('role_id', 1) // Default: Customer
        .query(`
          INSERT INTO tblUsers (full_name, email, phone_number, city, province, zip_code, join_date, is_active, role_id)
          VALUES (@full_name, @email, @phone_number, @city, @province, @zip_code, @join_date, @is_active, @role_id)
        `);

      // Re-query user
      result = await pool.request()
        .input('email', email)
        .query('SELECT user_id, role_id, is_active FROM tblUsers WHERE email = @email');
    }

    user = result.recordset[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 5. Return the token
    res.json({ token });

  } catch (err) {
    console.error('OAuth error (full):', err); // More useful than just err.message
    res.status(500).send('OAuth login failed');
  }
};
