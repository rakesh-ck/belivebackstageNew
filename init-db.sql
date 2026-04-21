-- MySQL Table Definitions for Believe Backstage

CREATE DATABASE IF NOT EXISTS believe_backstage;
USE believe_backstage;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('artist', 'label', 'admin') DEFAULT 'artist',
    clientNumber VARCHAR(20) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    promotionSetupDone BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Releases table
CREATE TABLE IF NOT EXISTS releases (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('audio', 'video') DEFAULT 'audio',
    genre VARCHAR(50) DEFAULT 'any',
    distributionType VARCHAR(50) DEFAULT 'digital',
    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
    containsExistingTrack BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id VARCHAR(36) PRIMARY KEY,
    releaseId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    isrc VARCHAR(20),
    fileUrl TEXT,
    duration INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (releaseId) REFERENCES releases(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL, -- Use 'all' for platform-wide notifications
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    `read` BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
