export class ArticleEntity {
  id!: number;
  title!: string;
  content!: string;
  imageUrls!: string[];
  views!: number;
  editorId!: string;
  categoryId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
