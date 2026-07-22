export class CommentEntity {
  id!: number;
  userId!: string;
  articleId!: number;
  comment!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
