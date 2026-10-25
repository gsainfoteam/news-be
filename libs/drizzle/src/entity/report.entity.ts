export class ReportEntity {
  id!: number;
  name!: string;
  email!: string;
  phone!: string;
  title!: string | null;
  description!: string;
  fileKeys!: string[];
  createdAt!: Date;
}
