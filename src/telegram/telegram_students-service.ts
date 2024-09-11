import TelegramBot, { SendMessageOptions, KeyboardButton } from 'node-telegram-bot-api';
import Task from '../models/Task';
import TelegramService from './telegram-service';
import PDFDocument from 'pdfkit';
import openAIService from '../models/openAI/openAI-service';

const TgAPI2 = process.env.TELEGRAM_API_2;

class TelegramBotStudents {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupListeners();
  }

  private setupListeners() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/gettasks/, this.handleGetTasks.bind(this));
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(chatId, 'Добро пожаловать! Используй /gettasks чтобы получить задания.');
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

  private async handleGetTasks(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    const razdelKeyboard = this.createKeyboard([['algebra', 'geometry', 'statistics']]);
    await this.bot.sendMessage(chatId, 'Выберите раздел:', razdelKeyboard);

    this.bot.once('message', async (razdelMsg) => {
      const razdel = razdelMsg.text;

      const gradeKeyboard = this.createKeyboard([['7', '8'], ['9', '10', '11', '12']]);
      await this.bot.sendMessage(chatId, 'Выберите класс:', gradeKeyboard);

      this.bot.once('message', async (gradeMsg) => {
        const grade = parseInt(gradeMsg.text || '0', 10);

        try {
          const tasks = await TelegramService.get_tasks(razdel!, grade);
          if (tasks.length > 0) {
            const tasksMessage = tasks.map((task, index) => 
              `Задание номер ${index + 1}:\nДано: ${task.description}\nСложность: ${task.difficulty}\n\nОт: ${task.name} из ${task.school_work}`
            ).join('\n\n');

            const aiTasks = await openAIService.getAIResponse(0.7, razdel || "", grade, tasksMessage);
            console.log(aiTasks)

            const aiTasksForPDF = aiTasks.map((task, index) => 
             `Задание номер ${index + 1}:\nДано: ${task.description}\nСложность: ${task.difficulty}\n\n`
            ).join('\n\n');

            const taskSolution = tasks.map((task, index) => 
                `Задание номер ${index + 1}:\nОтвет: ${task.solution}\nРешение: ${task.explanation}`
              ).join('\n\n');

            const aiAnswersForPDF = aiTasks.map((task, index) => 
              `Задание номер ${index + 1}:\nОтвет: ${task.solution}\nРешение: ${task.explanation}`
             ).join('\n\n');

            await this.bot.sendMessage(chatId, `Найденные задания:\n\n${tasksMessage}`);
            
            await this.createAndSendPDFFirst(chatId, tasksMessage, 'real_tasks.pdf', tasks);
            await this.createAndSendPDFFirst(chatId, aiTasksForPDF, 'tasks_AI.pdf', aiTasks);
            await this.createAndSendPDFSecond(chatId, taskSolution, 'real_solutions.pdf', tasks);
            await this.createAndSendPDFSecond(chatId, aiAnswersForPDF, 'solutions_AI.pdf', aiTasks);
            
            await this.bot.sendMessage(chatId, 'PDF документы с заданиями и решениями отправлены.');
            await this.handleStart(msg);
          } else {
            await this.bot.sendMessage(chatId, 'Заданий по выбранным критериям не найдено.');
            await this.handleStart(msg);
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          await this.bot.sendMessage(chatId, 'Произошла ошибка при получении заданий.');
        }
      });
    });
  }

  private createAndSendPDFFirst(chatId: number, content: string, filename: string, tasks: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.registerFont('DejaVu', '../../dejavu-sans/DejaVuSans.ttf');
        doc.font('DejaVu'); 

        doc.on('data', (chunk: any) => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);

            this.bot.sendDocument(chatId, pdfBuffer, {}, { 
                filename: filename, 
                contentType: 'application/pdf'
            })
            .then(() => resolve())
            .catch(reject);
        });

        doc.fontSize(12).text(content, 50, 50);
        tasks.forEach((task, index) => {
            doc.addPage();
            doc.fontSize(14).text(`Task ${index + 1}`, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Description: ${task.description}`);
            doc.moveDown();
            doc.text(`Difficulty: ${task.difficulty}`);
          });
        doc.end();
    });
}

private createAndSendPDFSecond(chatId: number, content: string, filename: string, tasks: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.registerFont('DejaVu', '../../dejavu-sans/DejaVuSans.ttf');
        doc.font('DejaVu'); 

        doc.on('data', (chunk: any) => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);

            this.bot.sendDocument(chatId, pdfBuffer, {}, { 
                filename: filename, 
                contentType: 'application/pdf'
            })
            .then(() => resolve())
            .catch(reject);
        });

        doc.fontSize(12).text(content, 50, 50);
        tasks.forEach((task, index) => {
            doc.addPage();
            doc.fontSize(14).text(`Task ${index + 1}`, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Description: ${task.description}`);
            doc.moveDown();
            doc.text(`Difficulty: ${task.difficulty}`);
            doc.fontSize(12).text(`Description: ${task.solution}`);
            doc.moveDown();
            doc.fontSize(12).text(`Description: ${task.explanation}`);
          });
        doc.end();
    });
}


}

export default new TelegramBotStudents(TgAPI2 || "");
