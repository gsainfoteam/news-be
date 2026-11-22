import { ApiProperty } from '@nestjs/swagger';
import { SESSION_REJECTED } from '@infoteam/account-nest';

class SessionRejectedDetailsDto {
  @ApiProperty({ example: 'consent_required' })
  reason!: string;
}

export class SessionRejectedDto {
  @ApiProperty({ example: SESSION_REJECTED })
  error!: typeof SESSION_REJECTED;

  @ApiProperty({
    description:
      'Send it back to /auth/login with the nickname within 5 minutes',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  })
  ticket!: string;

  @ApiProperty({ type: SessionRejectedDetailsDto })
  details!: SessionRejectedDetailsDto;
}
