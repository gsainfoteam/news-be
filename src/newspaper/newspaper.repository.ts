import { DrizzleService, NewspaperEntity, existOrThrow } from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { newspaper } from 'drizzle/schema';
import { CreateNewspaperDto } from './dto/req/create-newspaper.dto';
import { SearchNewspapersDto } from './dto/req/search-newspapers.dto';

@Injectable()
export class NewspaperRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  INSERT INTO newspaper (title, file_key) VALUES (...) RETURNING *;
  */
  async createNewspaper(body: CreateNewspaperDto): Promise<NewspaperEntity> {
    return await this.drizzleService.db
      .insert(newspaper)
      .values(body)
      .returning()
      .then((result) => result[0]);
  }

  /*
  SELECT * FROM newspaper
  ORDER BY created_at DESC, id DESC
  LIMIT limit OFFSET offset;
  */
  async findNewspapers({
    offset,
    limit,
  }: SearchNewspapersDto): Promise<NewspaperEntity[]> {
    return await this.drizzleService.db
      .select()
      .from(newspaper)
      .orderBy(desc(newspaper.createdAt), desc(newspaper.id))
      .limit(limit)
      .offset(offset);
  }

  /*
  SELECT COUNT(*) FROM newspaper;
  */
  async countNewspapers(): Promise<number> {
    return await this.drizzleService.db
      .select({ count: count() })
      .from(newspaper)
      .then((result) => result[0].count);
  }

  /*
  DELETE FROM newspaper WHERE id = id RETURNING *;
  */
  async deleteNewspaper(id: number): Promise<void> {
    await this.drizzleService.db
      .delete(newspaper)
      .where(eq(newspaper.id, id))
      .returning()
      .then(existOrThrow('Newspaper not found'));
  }
}
