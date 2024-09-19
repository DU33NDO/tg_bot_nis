import TelegramBot, {
  SendMessageOptions,
  KeyboardButton,
} from "node-telegram-bot-api";
import Task from "../models/Task";
import { PrismaClient } from "@prisma/client";
import { now } from "mongoose";

const prisma = new PrismaClient();

const TgAPI = process.env.TELEGRAM_API;

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
    await this.bot.sendMessage(
      chatId,
      "Добро пожаловать! Используй /createtask чтобы создать задание."
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

  private async handleNewTask(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

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
        await this.bot.sendMessage(
          chatId,
          "Выберите для какого класса предназначена задача:",
          gradeKeyboard
        );

        this.bot.once("message", async (gradeMsg) => {
          const grade = parseInt(gradeMsg.text || "0", 10);

          await this.bot.sendMessage(chatId, "Напишите свою задачу:");
          this.bot.once("message", async (taskMsg) => {
            const taskDescription = taskMsg.text;
            await this.bot.sendMessage(chatId, "Теперь, напишите ответ:");

            this.bot.once("message", async (solutionMsg) => {
              const solution = solutionMsg.text;
              await this.bot.sendMessage(
                chatId,
                "Последнее, напишите объяснение:"
              );

              this.bot.once("message", async (explanationMsg) => {
                const explanation = explanationMsg.text;

                const citiesKeyboard = this.createKeyboard([
                  ["Астана", "Алматы", "Караганда"],
                ]);
                await this.bot.sendMessage(
                  chatId,
                  "Выберите ваш город:",
                  citiesKeyboard
                );

                this.bot.once("message", async (cityMsg) => {
                  const userCity = cityMsg.text;
                  let userCityId = 0;
                  if (userCity === "Астана") {
                    userCityId = 1;
                  } else if (userCity === "Алматы") {
                    userCityId = 2;
                  } else if (userCity === "Караганда") {
                    userCityId = 3;
                  }

                  await this.bot.sendMessage(chatId, "Напишите своё имя:");
                  this.bot.once("message", async (nameMsg) => {
                    const userName = nameMsg.text;

                    await this.bot.sendMessage(
                      chatId,
                      "Напишите свою фамилию:"
                    );
                    this.bot.once("message", async (surNameMsg) => {
                      const surName = surNameMsg.text;

                      await this.bot.sendMessage(
                        chatId,
                        "В какой школе вы преподаете:"
                      );
                      this.bot.once("message", async (schoolMsg) => {
                        const userSchool = schoolMsg.text;
                        // schools остался
                        // const userCityId = prisma.school.findFirst({
                        //   where: { schoolName: userCity },
                        // });

                        if (userCity && userSchool) {
                          try {
                            // const cityDB = await prisma.city.upsert({
                            //   where: { cityName: userCity },
                            //   update: {},
                            //   create: { cityName: userCity },
                            // });

                            const schoolDB = await prisma.school.create({
                              data: {
                                city_id: userCityId,
                                school_name: userSchool,
                              },
                            });

                            const userTopicId = await prisma.topic.findFirst({
                              where: { topic_name: topic },
                            });
                            const userSubTopicId =
                              await prisma.subtopic.findFirst({
                                where: { subtopic_name: userSubTopic },
                              });

                            const authorDB = await prisma.author.upsert({
                              where: { author_id: userId },
                              update: {},
                              create: {
                                author_id: userId || 0,
                                author_name: userName || "",
                                author_surname: surName || "",
                                school_id: schoolDB.school_id,
                              },
                            });
                            const hierarchyDB = await prisma.hierarchy.upsert({
                              where: {
                                grades_id_subject_id_topic_id_subtopic_id: {
                                  grades_id: grade,
                                  subject_id: 1,
                                  topic_id: userTopicId?.topic_id || 0,
                                  subtopic_id: userSubTopicId?.subtopic_id ?? 0,
                                },
                              },
                              update: {},
                              create: {
                                grades_id: grade,
                                subject_id: 1,
                                topic_id: userTopicId?.topic_id || 0,
                                subtopic_id: userSubTopicId?.subtopic_id ?? 0,
                              },
                            });

                            const taskDB = await prisma.task.create({
                              data: {
                                hierarchy_id: hierarchyDB.hierarchy_id,
                                author_id: userId ?? 0,
                                task_create_date: now(),
                                task_approve_status: false,
                                task_title: `${topic} Task`,
                                task_text: taskDescription || "",
                              },
                            });

                            const answerDB = await prisma.answer.upsert({
                              where: {
                                task_id_task_answer: {
                                  task_id: taskDB.task_id,
                                  task_answer: solution || "no answer",
                                },
                              },
                              update: {},
                              create: {
                                task_id: taskDB.task_id,
                                task_answer: solution || "no answer",
                                task_solution: explanation || "no solution",
                              },
                            });
                            await this.bot.sendMessage(
                              chatId,
                              "Задание успешно сохранилось!"
                            );
                            await this.handleStart(msg);
                          } catch (error) {
                            console.error("Error saving task:", error);
                            await this.bot.sendMessage(
                              chatId,
                              "Возникла ошибка при создании задания."
                            );
                          }
                        }
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  async get_tasks(hierarchy_id: number) {
    try {
      const target_tasks = await prisma.task.findMany({
        where: { hierarchy_id },
      });
      return target_tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  }
}

export default new TelegramService(TgAPI || "");
