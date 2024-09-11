import TelegramBot, { SendMessageOptions, KeyboardButton } from 'node-telegram-bot-api';
import Task from '../models/Task'; 

const TgAPI = process.env.TELEGRAM_API

class TelegramService {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupListeners();
  }

  private setupListeners() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/createtask/, this.handleNewTask.bind(this));
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(chatId, 'Добро пожаловать! Используй /createtask чтобы создать задание.');
  }

  private createKeyboard(buttons: string[][]): SendMessageOptions {
    return {
      reply_markup: {
        keyboard: buttons.map(row => row.map(text => ({ text } as KeyboardButton))),
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    };
  }

  private async handleNewTask(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    const razdelKeyboard = this.createKeyboard([['algebra', 'geometry', 'statistics']]);
    await this.bot.sendMessage(chatId, 'Выберите раздел:', razdelKeyboard);
    
    this.bot.once('message', async (razdelMsg) => {
      const razdel = razdelMsg.text;

      const gradeKeyboard = this.createKeyboard([['7', '8'], ['9', '10', '11', '12']]);
      await this.bot.sendMessage(chatId, 'Выберите для какого класса предназначена задача:', gradeKeyboard);

      this.bot.once('message', async (gradeMsg) => {
        const grade = parseInt(gradeMsg.text || '0', 10);

        await this.bot.sendMessage(chatId, 'Напишите свою задачу:');
        this.bot.once('message', async (taskMsg) => {
          const taskDescription = taskMsg.text;
          await this.bot.sendMessage(chatId, 'Теперь, напишите ответ:');
          
          this.bot.once('message', async (solutionMsg) => {
            const solution = solutionMsg.text;
            await this.bot.sendMessage(chatId, 'Последнее, напишите объяснение:');

            this.bot.once('message', async (explanationMsg) => {
              const explanation = explanationMsg.text;

              const difficultyKeyboard = this.createKeyboard([['easy', 'med', 'hard']]);
              await this.bot.sendMessage(chatId, 'Выберите уровень сложности:', difficultyKeyboard);
              
              this.bot.once('message', async (difficultyMsg) => {
                const difficulty = difficultyMsg.text;

                await this.bot.sendMessage(chatId, 'Напишите своё имя:');
                this.bot.once('message', async (nameMsg) => {
                const userName = nameMsg.text;

                await this.bot.sendMessage(chatId, 'В какой школе вы преподаете:');
                this.bot.once('message', async (schoolMsg) => {
                    const userSchool = schoolMsg.text;

                    try {
                    const task = new Task({
                        creator_id: userId,
                        description: taskDescription,
                        solution: solution,
                        explanation: explanation,
                        razdel: razdel,
                        grade: grade,
                        difficulty: difficulty,
                        name: userName,  
                        school_work: userSchool  
                    });
                    await task.save();
                    await this.bot.sendMessage(chatId, 'Задание успешно сохранилось!');
                    await this.handleStart(msg);
                }   catch (error) {
                    console.error('Error saving task:', error);
                    await this.bot.sendMessage(chatId, 'Возникла ошибка при создании задания.');
                }
              });
            });
          });
        });
      });
    });
  })})}

  async get_tasks(razdel: string, grade: number) {
    try {
        const target_tasks = await Task.find({ razdel, grade });
        return target_tasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks');
      }
  }
}

export default new TelegramService(TgAPI || "");
