import { ForbiddenException, Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { Loggable } from '@lib/logger';
import { MemberDto } from './dto/res/member.dto';
import { MemberEntity } from '@lib/drizzle';
import { RegisterMembersDto } from './dto/req/register-members.dto';
import { UpdateMemberDto } from './dto/req/update-member.dto';

@Loggable()
@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async findMembers(): Promise<MemberDto[]> {
    const members = await this.memberRepository.findMembers();
    const users = await this.memberRepository.findUsersByEmails(
      members.map((member) => member.email),
    );
    return members.map(
      (member) =>
        new MemberDto(
          member,
          users.find((user) => user.email === member.email) ?? null,
        ),
    );
  }

  async registerMembers(members: RegisterMembersDto[]): Promise<void> {
    return await this.memberRepository.registerMembers(members);
  }

  async updateMember(
    callerId: string,
    id: string,
    body: UpdateMemberDto,
  ): Promise<void> {
    if (id === callerId)
      throw new ForbiddenException(
        'The editor-in-chief cannot update themselves',
      );
    return await this.memberRepository.updateMember(callerId, id, body);
  }

  async deleteMember(callerId: string, id: string): Promise<void> {
    if (id === callerId)
      throw new ForbiddenException(
        'The editor-in-chief cannot delete themselves',
      );
    return await this.memberRepository.deleteMember(id);
  }

  async findMemberByEmail(email: string): Promise<MemberEntity | null> {
    return await this.memberRepository.findMemberByEmail(email);
  }
}
