import 'dotenv/config';
import express from 'express';
import connectDB from './db';
import globalRouter from './global-router';
import TelegramBot from "node-telegram-bot-api";
import { logger } from './logger';
import TelegramService from './telegram/telegram-service';
import telegram_studentsService from './telegram/telegram_students-service';

const app = express();
const PORT = process.env.PORT || 3000;
const TelegramToken = process.env.TELEGRAM_API;

try {
  connectDB();
} catch (error) {
  console.log(`error with db: ${error}`)
}


app.use(logger);
app.use(express.json());
app.use('/api/v1/',globalRouter);

if (!TelegramToken) {
  console.error('TELEGRAM_API token is not set in the environment variables');
  process.exit(1);
}

try {
  const telegramService = TelegramService;
  const telegramServiceStudents = telegram_studentsService
  console.log('Telegram bot initialized successfully');
} catch (error) {
  console.error('Error initializing Telegram bot:', error);
  process.exit(1);
}

app.get('/',(request, response) =>{
  response.send("Hello World!");
})

app.listen(PORT, () => {
  console.log(`Server runs at http://localhost:${PORT}`);
});
