import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';
import { MemberGuard } from './guard/member.guard';
import { MemberService } from './member.service';
import { RegisterMembersDto } from './dto/req/register-members.dto';
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
    summary: 'Delete Member',
    description:
      '[Author: Editorship] Soft delete a member by recording the deletedAt timestamp. To mark someone as having left the team, set their role to ALUMNI instead so that their bylines survive.',
  })
  @ApiOkResponse({
    description: 'The member has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.EDITORSHIP)
  @UseGuards(MemberGuard)
  @Delete(':id')
  async deleteMember(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.memberService.deleteMember(id);
  }

  @ApiOperation({
    summary: 'Transfer Editorship',
    description:
      '[Author: Editorship] Hand the EDITORSHIP permission over to another member. The caller is demoted to EDITOR. Roles are not touched - update them separately.',
  })
  @ApiOkResponse({
    description: 'The editorship has been successfully transferred.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth('jwt')
  @RequiredPermission(Permission.EDITORSHIP)
  @UseGuards(MemberGuard)
  @Post(':id/editorship')
  async transferEditorship(
    @GetMember() member: MemberEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.memberService.transferEditorship(member.id, id);
  }
}
