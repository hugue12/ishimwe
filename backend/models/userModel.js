const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    try {
      const { username, password } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'INSERT INTO User (Username, Password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      return { success: true, userId: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute('SELECT * FROM User WHERE Username = ?', [username]);
      const user = rows[0];
      console.log('Database query result for user:', username, {
        found: !!user,
        keys: user ? Object.keys(user) : [],
        passwordField: user ? user.password : 'N/A'
      });

      // Convert lowercase field names to uppercase for consistency
      if (user) {
        user.UserID = user.id;
        user.Username = user.username;
        user.Password = user.password;
      }

      return user;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      // Add validation to prevent undefined arguments
      if (!plainPassword || !hashedPassword) {
        console.error('Password validation failed: missing arguments', {
          plainPassword: !!plainPassword,
          hashedPassword: !!hashedPassword
        });
        return false;
      }
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password validation error:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT UserID, Username, CreatedAt FROM User ORDER BY UserID');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, userData) {
    try {
      const { username, password } = userData;
      let query = 'UPDATE User SET Username = ?';
      let params = [username];

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', Password = ?';
        params.push(hashedPassword);
      }

      query += ' WHERE UserID = ?';
      params.push(userId);

      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(userId) {
    try {
      const [result] = await pool.execute('DELETE FROM User WHERE UserID = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
