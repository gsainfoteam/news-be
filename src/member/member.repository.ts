import {
  DrizzleService,
  MemberEntity,
  Role,
  existOrThrow,
  UserEntity,
} from '@lib/drizzle';
import { Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { member, user } from 'drizzle/schema';
import { RegisterMembersDto } from './dto/req/register-members.dto';
import { UpdateMemberDto } from './dto/req/update-member.dto';
import { DEFAULT_PERMISSION } from './member.policy';

@Injectable()
export class MemberRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /*
  SELECT *
  FROM member
  WHERE deleted_at IS NULL;
  */
  async findMembers(): Promise<MemberEntity[]> {
    return this.drizzleService.db
      .select()
      .from(member)
      .where(isNull(member.deletedAt));
  }

  /*
  INSERT INTO member (email, name, role, permission)
  VALUES (...);
  */
  async registerMembers(members: RegisterMembersDto[]): Promise<void> {
    await this.drizzleService.db.insert(member).values(
      members.map(({ email, name, role }) => ({
        email,
        name,
        role,
        permission: DEFAULT_PERMISSION[role],
      })),
    );
  }

  /*
  SELECT *
  FROM user
  WHERE email IN (emails);
  */
  async findUsersByEmails(emails: string[]): Promise<UserEntity[]> {
    if (emails.length === 0) return [];
    return await this.drizzleService.db
      .select()
      .from(user)
      .where(inArray(user.email, emails));
  }

  /*
  UPDATE member
  SET name = name, email = email, role = role, permission = permission, updated_at = NOW()
  WHERE id = id AND deleted_at IS NULL;
  */
  async updateMember(
    callerId: string,
    id: string,
    { role, ...values }: UpdateMemberDto,
  ): Promise<void> {
    await this.drizzleService.db.transaction(async (tx) => {
      await tx
        .update(member)
        .set({
          ...values,
          // 권한은 직접 받지 않고 직책에서 다시 도출한다
          ...(role && { role, permission: DEFAULT_PERMISSION[role] }),
          updatedAt: new Date(),
        })
        .where(and(eq(member.id, id), isNull(member.deletedAt)))
        .returning()
        .then(existOrThrow('Member not found'));

      // 편집장을 넘겼으면 넘긴 본인은 수습기자로 내려간다
      if (role !== Role.EDITOR_IN_CHIEF) return;

      await tx
        .update(member)
        .set({
          role: Role.CUB_REPORTER,
          permission: DEFAULT_PERMISSION[Role.CUB_REPORTER],
          updatedAt: new Date(),
        })
        .where(and(eq(member.id, callerId), isNull(member.deletedAt)))
        .returning()
        .then(existOrThrow('Member not found'));
    });
  }

  /*
  UPDATE member
  SET updated_at = NOW(), deleted_at = NOW()
  WHERE id = id AND deleted_at IS NULL;
  */
  async deleteMember(id: string): Promise<void> {
    await this.drizzleService.db
      .update(member)
      .set({ updatedAt: new Date(), deletedAt: new Date() })
      .where(and(eq(member.id, id), isNull(member.deletedAt)))
      .returning()
      .then(existOrThrow('Member not found'));
  }

  /*
  SELECT *
  FROM member
  WHERE email = email AND deleted_at IS NULL
  LIMIT 1;
  */
  async findMemberByEmail(email: string): Promise<MemberEntity | null> {
    return this.drizzleService.db
      .select()
      .from(member)
      .where(and(eq(member.email, email), isNull(member.deletedAt)))
      .limit(1)
      .then((row) => row[0]);
  }
}
