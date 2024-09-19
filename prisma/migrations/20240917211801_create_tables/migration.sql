-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "role" INTEGER NOT NULL,
    "school_id" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "School" (
    "school_id" SERIAL NOT NULL,
    "city_id" INTEGER,
    "school_name" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "City" (
    "city_id" SERIAL NOT NULL,
    "city_name" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subject_id" INTEGER NOT NULL,
    "subject_name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "topic_id" INTEGER NOT NULL,
    "topic_name" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "subtopic_id" INTEGER NOT NULL,
    "subtopic_name" TEXT NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("subtopic_id")
);

-- CreateTable
CREATE TABLE "Hierarchy" (
    "hierarchy_id" SERIAL NOT NULL,
    "grades_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "subtopic_id" INTEGER NOT NULL,

    CONSTRAINT "Hierarchy_pkey" PRIMARY KEY ("hierarchy_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "hierarchy_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "task_create_date" TIMESTAMP(3) NOT NULL,
    "task_approve_status" BOOLEAN NOT NULL,
    "task_approve_date" TIMESTAMP(3),
    "task_update_date" TIMESTAMP(3),
    "task_title" TEXT NOT NULL,
    "task_text" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "Author" (
    "author_id" SERIAL NOT NULL,
    "author_surname" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "task_id" INTEGER NOT NULL,
    "task_answer" TEXT NOT NULL,
    "task_solution" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("task_id","task_answer")
);

-- CreateTable
CREATE TABLE "Homework" (
    "hw_id" SERIAL NOT NULL,
    "hw_create_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("hw_id")
);

-- CreateTable
CREATE TABLE "HomeworkOnUsers" (
    "homework_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "HomeworkOnUsers_pkey" PRIMARY KEY ("homework_id","user_id")
);

-- CreateTable
CREATE TABLE "HomeworkOnTasks" (
    "homework_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "HomeworkOnTasks_pkey" PRIMARY KEY ("homework_id","task_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_chat_id_key" ON "User"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "School_school_id_key" ON "School"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "City_city_name_key" ON "City"("city_name");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_grade_id_key" ON "Grade"("grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subject_id_key" ON "Subject"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subject_name_key" ON "Subject"("subject_name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topic_id_key" ON "Topic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_subtopic_id_key" ON "Subtopic"("subtopic_id");

-- CreateIndex
CREATE UNIQUE INDEX "Hierarchy_hierarchy_id_key" ON "Hierarchy"("hierarchy_id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_task_id_key" ON "Task"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "Author_author_id_key" ON "Author"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "Homework_hw_id_key" ON "Homework"("hw_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hierarchy" ADD CONSTRAINT "Hierarchy_grades_id_fkey" FOREIGN KEY ("grades_id") REFERENCES "Grade"("grade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hierarchy" ADD CONSTRAINT "Hierarchy_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hierarchy" ADD CONSTRAINT "Hierarchy_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hierarchy" ADD CONSTRAINT "Hierarchy_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "Subtopic"("subtopic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_hierarchy_id_fkey" FOREIGN KEY ("hierarchy_id") REFERENCES "Hierarchy"("hierarchy_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Author"("author_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkOnUsers" ADD CONSTRAINT "HomeworkOnUsers_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "Homework"("hw_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkOnUsers" ADD CONSTRAINT "HomeworkOnUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkOnTasks" ADD CONSTRAINT "HomeworkOnTasks_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "Homework"("hw_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkOnTasks" ADD CONSTRAINT "HomeworkOnTasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;
