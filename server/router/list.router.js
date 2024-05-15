const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../config/knexfile'));
require('dotenv').config(); // Загрузить переменные среды из файла .env

const secretKey = process.env.JWT_SECRET; 

// Registration route
router.post('/Register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await knex('users').insert({
      name,
      email,
      password: hashedPassword
    }).returning('*');

    res.status(201).json({ message: 'Пользователь успешно создан', user: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не удалось зарегистрировать пользователя' });
  }
});

// Login route
router.post('/Login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await knex('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Сравнение паролей
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ message: 'Вход в систему прошел успешно', user, token });
  } catch (error) {
  console.error(error);
    res.status(500).json({ message: 'Не удалось зарегистрировать пользователя' });
  }
});

module.exports = router;
