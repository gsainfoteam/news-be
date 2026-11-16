import { BadRequestException, Injectable } from '@nestjs/common';
import { GithubService } from '@lib/github';
import { Loggable } from '@lib/logger';
import { AboutRepository } from './about.repository';
import { UpdateAboutDto } from './dto/req/update-about.dto';
import { CreateHistoryDto } from './dto/req/create-history.dto';
import { UpdateHistoryDto } from './dto/req/update-history.dto';
import { AboutDto } from './dto/res/about.dto';
import { HistoryDto } from './dto/res/history.dto';

@Loggable()
@Injectable()
export class AboutService {
  constructor(
    private readonly aboutRepository: AboutRepository,
    private readonly githubService: GithubService,
  ) {}

  async getAbout(): Promise<AboutDto> {
    const [about, histories] = await Promise.all([
      this.aboutRepository.getAbout(),
      this.aboutRepository.findHistories(),
    ]);
    return new AboutDto(about, histories);
  }

  async updateAbout(body: UpdateAboutDto): Promise<AboutDto> {
    const [about, histories] = await Promise.all([
      this.aboutRepository.updateAbout(body).then((about) => {
        this.githubService.triggerFrontendDeploy();
        return about;
      }),
      this.aboutRepository.findHistories(),
    ]);
    return new AboutDto(about, histories);
  }

  async createHistory(body: CreateHistoryDto): Promise<HistoryDto> {
    const history = await this.aboutRepository.createHistory(body);
    this.githubService.triggerFrontendDeploy();
    return new HistoryDto(history);
  }

  async updateHistory(id: number, body: UpdateHistoryDto): Promise<HistoryDto> {
    // history엔 updatedAt이 없어 빈 SET이 되면 drizzle이 에러를 던진다
    if (Object.keys(body).length === 0)
      throw new BadRequestException('Nothing to update');
    const history = await this.aboutRepository.updateHistory(id, body);
    this.githubService.triggerFrontendDeploy();
    return new HistoryDto(history);
  }

  async deleteHistory(id: number): Promise<void> {
    await this.aboutRepository.deleteHistory(id);
    this.githubService.triggerFrontendDeploy();
  }
}
