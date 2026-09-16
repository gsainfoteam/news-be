export class CommentEntity {
  id!: number;
  userId!: string;
  articleId!: number;
  parentId!: number | null;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
