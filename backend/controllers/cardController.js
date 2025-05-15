const { poolPromise } = require('../config/db');

exports.getMyCards = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', req.user.user_id)
      .query('SELECT * FROM tblCards WHERE user_id = @user_id');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllCards = async (req, res) => {
  const { city, province, card_status } = req.query;
  let query = 'SELECT * FROM tblCards c JOIN tblUsers u ON c.user_id = u.user_id WHERE 1=1';

  if (city) query += ` AND u.city = '${city}'`;
  if (province) query += ` AND u.province = '${province}'`;
  if (card_status) query += ` AND c.card_status = '${card_status}'`;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('card_id', req.params.id)
      .query('SELECT * FROM tblCards WHERE card_id = @card_id');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCardStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('card_id', req.params.id)
      .input('card_status', status)
      .query('UPDATE tblCards SET card_status = @card_status WHERE card_id = @card_id');
    res.json({ message: 'Card status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
