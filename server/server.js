const express = require('express');
const cors = require('cors');
const listRouter = require('./router/list.router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Добавьте JWT
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Модель пользователя (замените на вашу реальную модель)
const User = {
  findByEmail: async (email) => { /* Логика поиска пользователя по email */ },
  create: async (userData) => { /* Логика создания пользователя */ },
  update: async (userId, updates) => { /* Логика обновления пользователя */ },
  findByConfirmationToken: async (token) => { /* Логика поиска по токену */ },
};

// Регистрация
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, confirmed: false }); // Добавим подтверждение

    // Генерируем токен для подтверждения
    const confirmationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Отправляем email для подтверждения ( замените на вашу логику )
    // ... 

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован. Проверьте email для подтверждения.', token: confirmationToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Подтверждение регистрации
app.get('/auth/confirm/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(400).json({ error: 'Неверный токен' });
    }

    await User.update(user.id, { confirmed: true });

    res.json({ message: 'Аккаунт успешно подтвержден' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка подтверждения' });
  }
});

// Авторизация
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user || !user.confirmed) { // Проверяем подтверждение
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

app.use('/auth', listRouter);

app.get('/', (req, res) => {
  res.send('Welcome to My Cafe API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
