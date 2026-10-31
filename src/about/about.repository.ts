import {
  AboutEntity,
  DrizzleService,
  HistoryEntity,
  existOrThrow,
} from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { about, history } from 'drizzle/schema';
import { UpdateAboutDto } from './dto/req/update-about.dto';
import { CreateHistoryDto } from './dto/req/create-history.dto';
import { UpdateHistoryDto } from './dto/req/update-history.dto';

@Injectable()
export class AboutRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  SELECT * FROM about LIMIT 1;
  */
  async getAbout(): Promise<AboutEntity> {
    return await this.drizzleService.db
      .select()
      .from(about)
      .limit(1)
      .then(existOrThrow('About not found'));
  }

  /*
  SELECT * FROM history ORDER BY date ASC, id ASC;
  */
  async findHistories(): Promise<HistoryEntity[]> {
    return await this.drizzleService.db
      .select()
      .from(history)
      .orderBy(asc(history.date), asc(history.id));
  }

  /*
  UPDATE about SET ... RETURNING *;
  */
  async updateAbout(body: UpdateAboutDto): Promise<AboutEntity> {
    // about은 단일 행이라 WHERE 없이 갱신한다
    return await this.drizzleService.db
      .update(about)
      .set({ ...body, updatedAt: new Date() })
      .returning()
      .then(existOrThrow('About not found'));
  }

  /*
  INSERT INTO history (date, content) VALUES (...) RETURNING *;
  */
  async createHistory(body: CreateHistoryDto): Promise<HistoryEntity> {
    return await this.drizzleService.db
      .insert(history)
      .values(body)
      .returning()
      .then((result) => result[0]);
  }

  /*
  UPDATE history SET ... WHERE id = id RETURNING *;
  */
  async updateHistory(
    id: number,
    body: UpdateHistoryDto,
  ): Promise<HistoryEntity> {
    return await this.drizzleService.db
      .update(history)
      .set(body)
      .where(eq(history.id, id))
      .returning()
      .then(existOrThrow('History not found'));
  }

  /*
  DELETE FROM history WHERE id = id RETURNING *;
  */
  async deleteHistory(id: number): Promise<HistoryEntity> {
    return await this.drizzleService.db
      .delete(history)
      .where(eq(history.id, id))
      .returning()
      .then(existOrThrow('History not found'));
  }
}
