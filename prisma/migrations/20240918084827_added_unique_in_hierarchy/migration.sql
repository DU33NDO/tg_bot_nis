/*
  Warnings:

  - A unique constraint covering the columns `[grades_id,subject_id,topic_id,subtopic_id]` on the table `Hierarchy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Hierarchy_grades_id_subject_id_topic_id_subtopic_id_key" ON "Hierarchy"("grades_id", "subject_id", "topic_id", "subtopic_id");
