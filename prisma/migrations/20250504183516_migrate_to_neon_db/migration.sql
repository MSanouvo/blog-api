-- DropForeignKey
ALTER TABLE "ArticleLikes" DROP CONSTRAINT "ArticleLikes_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleLikes" DROP CONSTRAINT "ArticleLikes_likerId_fkey";

-- DropForeignKey
ALTER TABLE "Articles" DROP CONSTRAINT "Articles_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLikes" DROP CONSTRAINT "CommentLikes_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLikes" DROP CONSTRAINT "CommentLikes_likerId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_commenterId_fkey";

-- AlterTable
ALTER TABLE "ArticleLikes" ALTER COLUMN "likerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CommentLikes" ALTER COLUMN "likerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "commenterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleLikes" ADD CONSTRAINT "ArticleLikes_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleLikes" ADD CONSTRAINT "ArticleLikes_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
