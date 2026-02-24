import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'articles' })
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 500, nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 120, nullable: true })
  author?: string | null;

  @Column({ length: 120, nullable: true })
  category?: string | null;

  @Column({ length: 255, nullable: true })
  source?: string | null;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string | null;

  @Column({
    name: 'published_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  publishedAt!: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
