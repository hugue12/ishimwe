const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'CWSMS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Function to initialize database and tables
const initializeDatabase = async () => {
  try {
    console.log('Attempting to connect to MySQL...');

    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('Connected to MySQL successfully');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Create tables
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Please make sure MySQL is running and the credentials are correct');
    console.error('Current config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
  }
};

const createTables = async () => {
  try {
    // Create Package table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Package (
        PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
        PackageName VARCHAR(100) NOT NULL,
        PackageDescription TEXT,
        PackagePrice DECIMAL(10,2) NOT NULL
      )
    `);

    // Create Car table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Car (
        PlateNumber VARCHAR(20) PRIMARY KEY,
        CarType VARCHAR(50) NOT NULL,
        CarSize VARCHAR(20) NOT NULL,
        DriverName VARCHAR(100) NOT NULL,
        PhoneNumber VARCHAR(15) NOT NULL
      )
    `);

    // Create ServicePackage table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ServicePackage (
        RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
        PlateNumber VARCHAR(20) NOT NULL,
        PackageNumber INT NOT NULL,
        ServiceDate DATE NOT NULL,
        FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE,
        FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber) ON DELETE CASCADE
      )
    `);

    // Create Payment table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Payment (
        PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
        RecordNumber INT NOT NULL,
        AmountPaid DECIMAL(10,2) NOT NULL,
        PaymentDate DATE NOT NULL,
        FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber) ON DELETE CASCADE
      )
    `);

    // Create User table for authentication
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS User (
        UserID INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(50) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default package
    await pool.execute(`
      INSERT IGNORE INTO Package (PackageNumber, PackageName, PackageDescription, PackagePrice)
      VALUES (1, 'Basic wash', 'Exterior hand wash', 5000.00)
    `);

    // Insert default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Creating default user with hashed password length:', hashedPassword.length);

    // First, delete any existing admin user to avoid conflicts
    await pool.execute(`DELETE FROM User WHERE Username = 'admin'`);

    // Then insert the new admin user
    const [result] = await pool.execute(`
      INSERT INTO User (Username, Password)
      VALUES ('admin', ?)
    `, [hashedPassword]);

    console.log('Default admin user created successfully, ID:', result.insertId);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = { pool, initializeDatabase };
