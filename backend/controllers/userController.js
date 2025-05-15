const { poolPromise } = require('../config/db');

exports.getMyProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', req.user.user_id)
      .query('SELECT user_id, full_name, email, phone_number, city, province, zip_code, join_date FROM tblUsers WHERE user_id = @user_id');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { phone_number } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('user_id', req.user.user_id)
      .input('phone_number', phone_number)
      .query('UPDATE tblUsers SET phone_number = @phone_number WHERE user_id = @user_id');
    res.json({ message: 'Phone number updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM tblUsers');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', req.params.id)
      .query('SELECT * FROM tblUsers WHERE user_id = @user_id');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetUser = async (req, res) => {
  // Placeholder: implement credential reset logic later
  res.json({ message: 'Reset user credentials – not implemented yet.' });
};
