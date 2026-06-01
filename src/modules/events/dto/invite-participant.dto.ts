import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteParticipantDto {
  @ApiProperty({ example: ['user-id-1', 'user-id-2'] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
