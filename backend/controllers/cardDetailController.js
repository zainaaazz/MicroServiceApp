// backend/controllers/cardDetailController.js
const { poolPromise }    = require('../config/db');
const { sendOtpEmail }   = require('../services/emailService');
const bcrypt             = require('bcrypt');
const SALT_ROUNDS        = 10;

exports.requestDetailsOtp = async (req, res) => {
  const cardId = req.params.cardId;
  const userId = req.user.user_id;

  try {
    const pool = await poolPromise;

    // 1) confirm ownership
    const owner = await pool.request()
      .input('cardId', cardId)
      .query(`SELECT user_id FROM tblCards WHERE card_id=@cardId`);
    if (!owner.recordset.length || owner.recordset[0].user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2) generate & hash OTP
    const code   = Math.floor(100000 + Math.random() * 900000).toString();
    const hash   = await bcrypt.hash(code, SALT_ROUNDS);
    const expiry = new Date(Date.now() + 5*60*1000); // 5 minutes

    // 3) store it
    await pool.request()
      .input('cardId',  cardId)
      .input('hash',    hash)
      .input('expires', expiry)
      .query(`
        INSERT INTO tblCardOtps (card_id, code_hash, expires_at)
        VALUES (@cardId, @hash, @expires)
      `);

    // 4) get user email & send
    const info = await pool.request()
      .input('cardId', cardId)
      .query(`
        SELECT u.email, u.full_name, c.card_number
        FROM tblCards c
        JOIN tblUsers u ON u.user_id=c.user_id
        WHERE c.card_id=@cardId
      `);

    const { email, full_name, card_number } = info.recordset[0];
    await sendOtpEmail({ to: email, fullName: full_name, cardNum: card_number, code });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.verifyDetailsOtp = async (req, res) => {
  const { code } = req.body;
  const cardId   = req.params.cardId;
  const userId   = req.user.user_id;

  try {
    const pool = await poolPromise;

    // 1) confirm ownership
    const owner = await pool.request()
      .input('cardId', cardId)
      .query(`SELECT user_id FROM tblCards WHERE card_id=@cardId`);
    if (!owner.recordset.length || owner.recordset[0].user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2) fetch latest valid OTP
    const otpRow = await pool.request()
      .input('cardId', cardId)
      .query(`
        SELECT TOP 1 otp_id, code_hash
        FROM tblCardOtps
        WHERE card_id=@cardId
          AND used=0
          AND expires_at > SYSUTCDATETIME()
        ORDER BY created_at DESC
      `);
    if (!otpRow.recordset.length) {
      return res.status(400).json({ error: 'No valid code' });
    }

    const { otp_id, code_hash } = otpRow.recordset[0];
    const ok = await bcrypt.compare(code, code_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    // 3) mark used
    await pool.request()
      .input('otpId', otp_id)
      .query(`UPDATE tblCardOtps SET used=1 WHERE otp_id=@otpId`);

    // 4) return sensitive details
    const details = await pool.request()
      .input('cardId', cardId)
      .query(`
        SELECT card_number, expiry_date, cvv
        FROM tblCards
        WHERE card_id=@cardId
      `);

    res.json(details.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
