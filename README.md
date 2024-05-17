# Password Vault

Password Vault is a simple application that allows you to securely store and manage your website passwords. It uses a MySQL database to store the passwords and provides an Express.js API for interacting with the data.

## Installation

To get started, follow these steps:

1. Install the necessary packages using npm:

   ```bash

   npm install 

   npm install express mysql cors nodemon

## Making a database

1. Database Name: password_vault
2. CREATE TABLE passwords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

## To Run

1. npm start and npm run dev (different terminals)

## Developer

jamesmante
