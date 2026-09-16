import { Category } from '../enum';

export class ArticleEntity {
  id!: number;
  title!: string;
  subtitle!: string | null;
  content!: string;
  imageKeys!: string[] | null;
  views!: number;
  editorId!: string;
  categories!: Category[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
