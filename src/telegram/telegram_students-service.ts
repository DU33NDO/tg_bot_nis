import TelegramBot, {
  SendMessageOptions,
  KeyboardButton,
} from "node-telegram-bot-api";
import TelegramService from "./telegram-service";
import PDFDocument from "pdfkit";
import openAIService from "../models/openAI/openAI-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    await this.bot.sendMessage(
      chatId,
      "Добро пожаловать! Используй /gettasks чтобы получить задания."
    );
  }

  private createKeyboard(buttons: string[][]): SendMessageOptions {
    return {
      reply_markup: {
        keyboard: buttons.map((row) =>
          row.map((text) => ({ text } as KeyboardButton))
        ),
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    };
  }

  private async handleGetTasks(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    const topicKeyboard = this.createKeyboard([
      [
        "Арифметика и алгебра",
        "Геометрия",
        "Теория вероятностей и статистика",
        "Линейные уравнения и неравенства",
        "Функции и графики",
        "Квадратные уравнения",
        "Многочлены и их свойства",
        "Тригонометрия",
      ],
    ]);
    await this.bot.sendMessage(chatId, "Выберите раздел:", topicKeyboard);

    this.bot.once("message", async (topicMsg) => {
      const topic = topicMsg.text;

      let subTopicKeyboard: SendMessageOptions;

      switch (topic) {
        case "Арифметика и алгебра":
          subTopicKeyboard = this.createKeyboard([
            [
              "Десятичные дроби",
              "Проценты и пропорции",
              "Степени и корни",
              "Логарифмы",
              "Арифметические и геометрические прогрессии",
            ],
          ]);
          break;

        case "Геометрия":
          subTopicKeyboard = this.createKeyboard([
            [
              "Треугольники и их свойства",
              "Четырехугольники и многоугольники",
              "Окружности и круги",
              "Площади и объемы",
              "Векторы и координаты на плоскости",
            ],
          ]);
          break;

        case "Теория вероятностей и статистика":
          subTopicKeyboard = this.createKeyboard([
            [
              "Основные понятия теории вероятностей",
              "Средние значения",
              "Дисперсия и стандартное отклонение",
              "Вероятностные распределения",
            ],
          ]);
          break;

        case "Линейные уравнения и неравенства":
          subTopicKeyboard = this.createKeyboard([
            [
              "Решение линейных уравнений",
              "Системы уравнений",
              "Линейные неравенства",
            ],
          ]);
          break;

        case "Функции и графики":
          subTopicKeyboard = this.createKeyboard([
            [
              "Линейная функция",
              "Квадратичная функция",
              "Графики степенных функций",
              "Графики обратных функций",
            ],
          ]);
          break;

        case "Квадратные уравнения":
          subTopicKeyboard = this.createKeyboard([
            [
              "Формула дискриминанта",
              "Метод нахождения корней",
              "Теорема Виета",
              "Графики квадратичных уравнений",
            ],
          ]);
          break;

        case "Многочлены и их свойства":
          subTopicKeyboard = this.createKeyboard([
            [
              "Операции с многочленами",
              "Разложение многочленов на множители",
              "Теорема Безу",
            ],
          ]);
          break;

        case "Тригонометрия":
          subTopicKeyboard = this.createKeyboard([
            [
              "Определение синуса, косинуса и тангенса",
              "Тригонометрические уравнения",
              "Основные тригонометрические тождества",
              "Применение тригонометрии в геометрии",
            ],
          ]);
          break;

        default:
          await this.bot.sendMessage(chatId, "Выберите корректный раздел.");
          return;
      }

      await this.bot.sendMessage(
        chatId,
        "Выберите подраздел:",
        subTopicKeyboard
      );
      this.bot.once("message", async (subTopicMsg) => {
        const userSubTopic = subTopicMsg.text;

        const gradeKeyboard = this.createKeyboard([
          ["7", "8"],
          ["9", "10", "11", "12"],
        ]);
        await this.bot.sendMessage(chatId, "Выберите класс:", gradeKeyboard);

        this.bot.once("message", async (gradeMsg) => {
          const grade = parseInt(gradeMsg.text || "0", 10);
          const hierarchy = await prisma.hierarchy.upsert({
            where: {
              grades_id_subject_id_topic_id_subtopic_id: {
                grades_id: grade,
                subject_id: 1,
                topic_id: await this.getTopicId(topic),
                subtopic_id: await this.getSubtopicId(userSubTopic || ""),
              },
            },
            update: {},
            create: {
              grades_id: grade,
              subject_id: 1,
              topic_id: await this.getTopicId(topic),
              subtopic_id: await this.getSubtopicId(userSubTopic || ""),
            },
          });

          try {
            const tasks = await TelegramService.get_tasks(
              hierarchy.hierarchy_id
            );
            if (tasks.length > 0) {
              const tasksWithAuthors = await Promise.all(
                tasks.map(async (task) => {
                  const author = await prisma.author.findUnique({
                    where: { author_id: task.author_id },
                    select: {
                      author_name: true,
                      author_surname: true,
                      School: { select: { school_name: true } },
                    },
                  });
                  return { ...task, author };
                })
              );
              const tasksMessage = tasksWithAuthors
                .map(
                  (task, index) =>
                    `Задание номер ${task.task_id}:\nДано: ${task.task_text}\nОт: ${task.author?.author_name} ${task.author?.author_surname} из ${task.author?.School.school_name}`
                )
                .join("\n\n");

              const aiTasks = await openAIService.getAIResponse(
                0.7,
                topic || "",
                grade,
                tasksMessage
              );
              console.log(`AI TASKS -${aiTasks}`);

              const aiTasksForPDF = aiTasks
                .map(
                  (task, index) =>
                    `Задание номер ${index + 1}:\nДано: ${
                      task.description
                    }\nСложность: ${task.difficulty}\n\n`
                )
                .join("\n\n");

              const taskSolution = await Promise.all(
                tasks.map(async (task, index) => {
                  const answer = await prisma.answer.findFirst({
                    where: { task_id: task.task_id },
                  });
                  return `Задание номер ${index + 1}:\nОтвет: ${
                    answer?.task_answer || "Нет ответа"
                  }\nРешение: ${answer?.task_solution || "Нет решения"}`;
                })
              );

              const taskSolutionText = taskSolution.join("\n\n");

              const aiAnswersForPDF = aiTasks
                .map(
                  (task, index) =>
                    `Задание номер ${index + 1}:\nОтвет: ${
                      task.solution
                    }\nРешение: ${task.explanation}`
                )
                .join("\n\n");

              await this.bot.sendMessage(
                chatId,
                `Найденные задания:\n\n${tasksMessage}`
              );

              await this.createAndSendPDFFirst(
                chatId,
                tasksMessage,
                "real_tasks.pdf",
                tasks
              );
              await this.createAndSendPDFFirst(
                chatId,
                aiTasksForPDF,
                "tasks_AI.pdf",
                aiTasks
              );
              await this.createAndSendPDFSecond(
                chatId,
                taskSolution.join("\n\n"),
                "real_solutions.pdf",
                tasks
              );
              await this.createAndSendPDFSecond(
                chatId,
                aiAnswersForPDF,
                "solutions_AI.pdf",
                aiTasks
              );

              await this.bot.sendMessage(
                chatId,
                "PDF документы с заданиями и решениями отправлены."
              );
              await this.handleStart(msg);
            } else {
              await this.bot.sendMessage(
                chatId,
                "Заданий по выбранным критериям не найдено."
              );
              await this.handleStart(msg);
            }
          } catch (error) {
            console.error("Error fetching tasks:", error);
            await this.bot.sendMessage(
              chatId,
              "Произошла ошибка при получении заданий."
            );
          }
        });
      });
    });
  }

  private async getTopicId(topicName: string): Promise<number> {
    const topic = await prisma.topic.findFirst({
      where: { topic_name: topicName },
    });
    return topic?.topic_id ?? 0;
  }

  private async getSubtopicId(subtopicName: string): Promise<number> {
    const subtopic = await prisma.subtopic.findFirst({
      where: { subtopic_name: subtopicName },
    });
    return subtopic?.subtopic_id ?? 0;
  }

  private createAndSendPDFFirst(
    chatId: number,
    content: string,
    filename: string,
    tasks: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.registerFont("DejaVu", "../../dejavu-sans/DejaVuSans.ttf");
      doc.font("DejaVu");

      doc.on("data", (chunk: any) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);

        this.bot
          .sendDocument(
            chatId,
            pdfBuffer,
            {},
            {
              filename: filename,
              contentType: "application/pdf",
            }
          )
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

  private createAndSendPDFSecond(
    chatId: number,
    content: string,
    filename: string,
    tasks: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.registerFont("DejaVu", "../../dejavu-sans/DejaVuSans.ttf");
      doc.font("DejaVu");

      doc.on("data", (chunk: any) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);

        this.bot
          .sendDocument(
            chatId,
            pdfBuffer,
            {},
            {
              filename: filename,
              contentType: "application/pdf",
            }
          )
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
