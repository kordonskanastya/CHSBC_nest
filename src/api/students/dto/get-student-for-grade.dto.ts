import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'

export class GetStudentForGradeDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  group: CreateGroupResponseDto

  @Expose()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  user: GetUserResponseDto
}
