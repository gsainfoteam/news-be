import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { MemberGuard } from './guard/member.guard';
import { MemberService } from './member.service';
import { RegisterMembersDto } from './dto/req/register-members.dto';
import { UpdateMemberDto } from './dto/req/update-member.dto';
import { RequiredPermission } from './decorator/permission.decorator';
import { MemberDto } from './dto/res/member.dto';
import { GetMember } from './decorator/get-member.decorator';
import { MemberEntity, Permission } from '@lib/drizzle';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: 'Get Members',
    description: '[Author: Editor] Retrieve every registered member.',
  })
  @ApiOkResponse({
    type: [MemberDto],
    description: 'The members have been successfully retrieved.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @UseGuards(MemberGuard)
  @Get()
  async getMembers(): Promise<MemberDto[]> {
    return await this.memberService.findMembers();
  }

  @ApiOperation({
    summary: 'Register Members',
    description:
      '[Author: Editorship] Register new members. The initial permission is derived from the given role.',
  })
  @ApiBody({ type: [RegisterMembersDto] })
  @ApiOkResponse({
    description: 'The members have been successfully registered.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.EDITORSHIP)
  @UseGuards(MemberGuard)
  @Post()
  async registerMembers(
    @Body(new ParseArrayPipe({ items: RegisterMembersDto }))
    body: RegisterMembersDto[],
  ): Promise<void> {
    await this.memberService.registerMembers(body);
  }

  @ApiOperation({
    summary: 'Update Member',
    description:
      '[Author: Editorship] Update the name, email or role of a member. The permission is re-derived from the role and cannot be set directly. Setting the role to EDITOR_IN_CHIEF hands the editorship over, demoting the caller to CUB_REPORTER in the same transaction. The caller cannot update themselves.',
  })
  @ApiOkResponse({
    description: 'The member has been successfully updated.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden, or the caller tried to update themselves',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiConflictResponse({ description: 'The email is already taken' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.EDITORSHIP)
  @UseGuards(MemberGuard)
  @Patch(':id')
  async updateMember(
    @GetMember() member: MemberEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMemberDto,
  ): Promise<void> {
    await this.memberService.updateMember(member.id, id, body);
  }

  @ApiOperation({
    summary: 'Delete Member',
    description:
      '[Author: Editorship] Soft delete a member by recording the deletedAt timestamp. To mark someone as having left the team, set their role to ALUMNI instead so that their bylines survive. The caller cannot delete themselves.',
  })
  @ApiOkResponse({
    description: 'The member has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden, or the caller tried to delete themselves',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.EDITORSHIP)
  @UseGuards(MemberGuard)
  @Delete(':id')
  async deleteMember(
    @GetMember() member: MemberEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.memberService.deleteMember(member.id, id);
  }
}
