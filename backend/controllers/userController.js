// controllers/userController.js
require('dotenv').config();
const { poolPromise } = require('../config/db');
const logger          = require('../utils/logger');
const bcrypt          = require('bcryptjs');

// ─── Get current user (Customer) ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', req.user.user_id)
      .query(`
        SELECT user_id, full_name, email, phone_number, city,
               province, zip_code, join_date, is_active, role_id
        FROM tblUsers
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.recordset[0]);

  } catch (err) {
    logger.error('getMe error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Update current user (Customer) ───────────────────────────────────────────
exports.updateMe = async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    city,
    province,
    zip_code,
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('user_id',      req.user.user_id)
      .input('full_name',    full_name)
      .input('email',        email)
      .input('phone_number', phone_number)
      .input('city',         city)
      .input('province',     province)
      .input('zip_code',     zip_code)
      .query(`
        UPDATE tblUsers
        SET full_name    = @full_name,
            email        = @email,
            phone_number = @phone_number,
            city         = @city,
            province     = @province,
            zip_code     = @zip_code
        WHERE user_id = @user_id
      `);

    // re-fetch updated record
    const result = await pool.request()
      .input('user_id', req.user.user_id)
      .query(`
        SELECT user_id, full_name, email, phone_number, city,
               province, zip_code, join_date, is_active, role_id
        FROM tblUsers
        WHERE user_id = @user_id
      `);

    logger.info(`User ${req.user.user_id} updated their profile`);
    res.json(result.recordset[0]);

  } catch (err) {
    logger.error('updateMe error', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
};

// ─── List all users (Bank Staff) ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT user_id, full_name, email, phone_number, city,
               province, zip_code, join_date, is_active, role_id
        FROM tblUsers
      `);
    res.json(result.recordset);
  } catch (err) {
    logger.error('getAllUsers error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Get user by ID (Bank Staff) ──────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('user_id', id)
      .query(`
        SELECT user_id, full_name, email, phone_number, city,
               province, zip_code, join_date, is_active, role_id
        FROM tblUsers
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.recordset[0]);

  } catch (err) {
    logger.error('getUserById error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Reset user credentials (Bank Staff) ───────────────────────────────────────
exports.resetUser = async (req, res) => {
  const { id } = req.params;
  try {
    const defaultPassword = process.env.DEFAULT_RESET_PASSWORD || 'ChangeMe123!';
    const salt            = await bcrypt.genSalt(10);
    const hashed          = await bcrypt.hash(defaultPassword, salt);

    const pool = await poolPromise;
    await pool.request()
      .input('user_id', id)
      .input('password', hashed)
      .query(`
        UPDATE tblUsers
        SET password = @password
        WHERE user_id = @user_id
      `);

    logger.info(`User ${id} credentials reset by staff`);
    res.json({ message: 'User password has been reset to default.' });
  } catch (err) {
    logger.error('resetUser error', err);
    res.status(500).json({ error: 'Could not reset user credentials' });
  }
};
