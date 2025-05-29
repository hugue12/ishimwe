const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize SQLite database with tables
const initializeSQLiteDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Package table
      db.run(`
        CREATE TABLE IF NOT EXISTS Package (
          PackageNumber INTEGER PRIMARY KEY AUTOINCREMENT,
          PackageName TEXT NOT NULL,
          PackageDescription TEXT,
          PackagePrice REAL NOT NULL
        )
      `);

      // Create Car table
      db.run(`
        CREATE TABLE IF NOT EXISTS Car (
          PlateNumber TEXT PRIMARY KEY,
          CarType TEXT NOT NULL,
          CarSize TEXT NOT NULL,
          DriverName TEXT NOT NULL,
          PhoneNumber TEXT NOT NULL
        )
      `);

      // Create ServicePackage table
      db.run(`
        CREATE TABLE IF NOT EXISTS ServicePackage (
          RecordNumber INTEGER PRIMARY KEY AUTOINCREMENT,
          PlateNumber TEXT NOT NULL,
          PackageNumber INTEGER NOT NULL,
          ServiceDate DATE NOT NULL,
          FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE,
          FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber) ON DELETE CASCADE
        )
      `);

      // Create Payment table
      db.run(`
        CREATE TABLE IF NOT EXISTS Payment (
          PaymentNumber INTEGER PRIMARY KEY AUTOINCREMENT,
          RecordNumber INTEGER NOT NULL,
          AmountPaid REAL NOT NULL,
          PaymentDate DATE NOT NULL,
          FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber) ON DELETE CASCADE
        )
      `);

      // Create User table
      db.run(`
        CREATE TABLE IF NOT EXISTS User (
          UserID INTEGER PRIMARY KEY AUTOINCREMENT,
          Username TEXT UNIQUE NOT NULL,
          Password TEXT NOT NULL,
          CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default package
      db.run(`
        INSERT OR IGNORE INTO Package (PackageNumber, PackageName, PackageDescription, PackagePrice)
        VALUES (1, 'Basic wash', 'Exterior hand wash', 5000.00)
      `);

      // Insert default admin user (password: admin123)
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO User (Username, Password)
        VALUES ('admin', ?)
      `, [hashedPassword], (err) => {
        if (err) {
          console.error('Error creating default user:', err);
          reject(err);
        } else {
          console.log('SQLite database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initializeSQLiteDatabase };
