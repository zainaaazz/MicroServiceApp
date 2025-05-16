// controllers/cardController.js
const { poolPromise } = require('../config/db');
const logger          = require('../utils/logger');
const { sendCardStatusEmail } = require('../services/emailService');

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
