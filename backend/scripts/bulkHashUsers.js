const bcrypt = require('bcryptjs');
const { poolPromise } = require('../config/db');

const hashAndUpdatePasswords = async () => {
  const plainPassword = 'test123';
  const hashed = await bcrypt.hash(plainPassword, 10);

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('hashed_password', hashed)
      .query(`
        UPDATE tblUsers
        SET hashed_password = @hashed_password
      `);

    console.log(`✅ Updated ${result.rowsAffected[0]} users with hashed password.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating passwords:', err);
    process.exit(1);
  }
};

hashAndUpdatePasswords();
