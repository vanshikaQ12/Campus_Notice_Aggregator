# Campus Notice Aggregator

A web-based platform that centralizes campus announcements and makes important academic and extracurricular information easily accessible to students.

## Features

### Student
- Student registration and login
- Personalized dashboard
- View campus notices
- Search notices by keyword
- Filter notices by category and semester
- View personal profile

### Admin
- Secure admin login
- Publish new notices
- Edit existing notices
- Delete notices
- Pin important announcements

### General
- Role-based access control
- Session-based authentication
- Password hashing
- MongoDB database integration
- Automatic filtering of expired notices

## Technologies Used

- HTML, CSS and JavaScript
- Node.js and Express.js
- MongoDB and Mongoose
- bcrypt.js
- Express Sessions

## Installation

1. Clone this repository.
2. Open the project folder in Terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file using `.env.example` as a reference.
5. Add your own MongoDB connection string and secret values.
6. Start the application:

   ```bash
   npm start
   ```

7. Open `http://localhost:3000` in your browser.

## User Roles

- **Student:** Can view and search campus announcements.
- **Admin:** Can publish, edit, delete and pin announcements.

Public registration creates student accounts. Admin accounts are created through the protected admin setup process.

## Project Purpose

Campus Notice Aggregator aims to simplify campus communication by providing a centralized platform for publishing, managing and accessing university announcements.