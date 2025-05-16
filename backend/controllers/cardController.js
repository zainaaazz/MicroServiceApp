// controllers/cardController.js
const { poolPromise } = require('../config/db');
const logger          = require('../utils/logger');
const { sendCardStatusEmail } = require('../services/emailService');
const nodemailer      = require('nodemailer');
const crypto          = require('crypto');

const otpStore = new Map(); // cardId -> { code, expiresAt }

exports.getMyCards = async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('user_id', req.user.user_id)
      .query('SELECT * FROM tblCards WHERE user_id = @user_id');
    res.json(result.recordset);
  } catch (err) {
    logger.error('getMyCards error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllCards = async (req, res) => {
  const { city, province, card_status } = req.query;

  try {
    const pool    = await poolPromise;
    let request   = pool.request();
    let sql       = `
      SELECT 
        c.card_id,
        c.user_id,
        c.card_number,
        c.card_type,
        c.expiry_date,
        c.card_status,
        c.current_balance,
        u.full_name,
        u.city,
        u.province
      FROM tblCards c
      JOIN tblUsers u ON c.user_id = u.user_id
      WHERE 1=1
    `;

    if (city) {
      sql       += ` AND u.city = @city`;
      request.input('city', city);
    }
    if (province) {
      sql       += ` AND u.province = @province`;
      request.input('province', province);
    }
    if (card_status) {
      sql       += ` AND c.card_status = @card_status`;
      request.input('card_status', card_status);
    }

    const result = await request.query(sql);
    res.json(result.recordset);

  } catch (err) {
    logger.error('getAllCards error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('card_id', req.params.id)
      .query('SELECT * FROM tblCards WHERE card_id = @card_id');
    res.json(result.recordset[0]);
  } catch (err) {
    logger.error('getCardById error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCardStatus = async (req, res) => {
  const { status } = req.body;
  const cardId     = req.params.id;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('card_id', req.params.id)
      .input('card_status', status)
      .query('UPDATE tblCards SET card_status = @card_status WHERE card_id = @card_id');
    
      // 2) fetch the user’s email, full_name, and card_number

      const info = await pool.request()
     .input('card_id', cardId)
     .query(`
       SELECT u.email,
              u.full_name,
              c.card_number
       FROM tblCards c
       JOIN tblUsers  u ON c.user_id = u.user_id
       WHERE c.card_id = @card_id
     `);

   if (info.recordset.length) {
     const { email, full_name, card_number } = info.recordset[0];
     // 3) send the notification email (fire-and-forget)
     sendCardStatusEmail({
       to:        email,
       fullName:  full_name,
       cardNum:   card_number,
       newStatus: status
     }).catch(err => {
       logger.error('Email send failure', err);
     });
   }
    
      logger.info(`Card ${cardId} status set to ${status}`);
      res.json({ message: 'Card status updated' });
  } catch (err) {
    logger.error('updateCardStatus error', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// configure transporter once
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 1) send code
exports.requestDetailsOtp = async (req, res) => {
  const cardId = Number(req.params.cardId);
  const userId = req.user.user_id;

  try {
    const pool = await poolPromise;
    // ensure they own that card
    const { recordset } = await pool.request()
      .input('cardId', cardId)
      .query('SELECT user_id FROM tblCards WHERE card_id=@cardId');
    if (recordset.length === 0 || recordset[0].user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // generate 6-digit random code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cardId, { code, expiresAt });

    // email to user
    const userRes = await pool.request()
      .input('userId', userId)
      .query('SELECT email FROM tblUsers WHERE user_id=@userId');
    const toEmail = userRes.recordset[0].email;

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      toEmail,
      subject: 'Your one-time card-details access code',
      text:    `Your code to view card #${cardId} details is: ${code}`
    });

    logger.info(`Sent details OTP for card ${cardId} to user ${userId}`);
    res.json({ message: 'Code sent' });
  } catch (err) {
    logger.error('requestDetailsOtp error', err);
    res.status(500).json({ error: 'Could not send code' });
  }
};

// 2) verify code & return real card details
exports.verifyDetailsOtp = async (req, res) => {
  const cardId = Number(req.params.cardId);
  const { code } = req.body;
  const record = otpStore.get(cardId);

  if (!record || record.expiresAt < Date.now() || record.code !== code) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  try {
    const pool = await poolPromise;
    const { recordset } = await pool.request()
      .input('cardId', cardId)
      .query('SELECT card_number, expiry_date, cvv FROM tblCards WHERE card_id=@cardId');

    // once used, delete
    otpStore.delete(cardId);

    res.json(recordset[0]);
  } catch (err) {
    logger.error('verifyDetailsOtp error', err);
    res.status(500).json({ error: 'Server error' });
  }
};