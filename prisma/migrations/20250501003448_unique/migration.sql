/*
  Warnings:

  - A unique constraint covering the columns `[articleId,likerId]` on the table `ArticleLikes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commentId,likerId]` on the table `CommentLikes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ArticleLikes_articleId_likerId_key" ON "ArticleLikes"("articleId", "likerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLikes_commentId_likerId_key" ON "CommentLikes"("commentId", "likerId");
