import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Loggable } from '@lib/logger';
import { UserEntity } from '@lib/drizzle';
import { UserDto } from './dto/res/user.dto';
import { EditorService } from 'src/editor/editor.service';
import { RegisterUserDto } from './dto/req/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { JwtTokenType } from 'src/auth/types/jwt-token.type';
import { UpdateNicknameDto } from './dto/req/update-nickname.dto';
import { UpdateConsentDto } from './dto/req/update-consent.dto';

@Loggable()
@Injectable()
export class UserService {
  private readonly jwtTempSecret: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly editorService: EditorService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.jwtTempSecret =
      this.configService.getOrThrow<string>('JWT_TEMP_SECRET');
  }

  async registerUser({
    tempToken,
    nickname,
  }: RegisterUserDto): Promise<JwtTokenType> {
    const payload: JwtPayload = await this.jwtService
      .verifyAsync<JwtPayload>(tempToken, {
        secret: this.jwtTempSecret,
      })
      .catch(() => {
        throw new UnauthorizedException('invalid token');
      });
    const { sub } = payload;
    if (!sub) throw new UnauthorizedException('invalid token');

    await this.userRepository.registerUser(sub, nickname);

    return await this.authService.issueTokens(sub);
  }

  async getMe(user: UserEntity): Promise<UserDto> {
    const editor = await this.editorService.findEditorByEmail(user.email);
    return new UserDto(user, editor);
  }

  async updateConsent(user: UserEntity, body: UpdateConsentDto): Promise<void> {
    await this.userRepository.updateConsent(user.id, body);
  }

  async updateNickname(
    user: UserEntity,
    { nickname }: UpdateNicknameDto,
  ): Promise<void> {
    await this.userRepository.updateNickname(user.id, nickname);
  }

  async findUserById(id: string): Promise<UserEntity> {
    return await this.userRepository.findUserById(id);
  }
}
