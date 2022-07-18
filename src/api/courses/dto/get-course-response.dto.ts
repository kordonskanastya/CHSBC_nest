import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetCourseResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string

  // @Expose()
  // @ApiProperty({ type: Number })
  // credits: number
  //
  // @Expose()
  // @ApiProperty({ type: Number })
  // lectureHours: number
  //
  // @Expose()
  // @ApiProperty({ type: Number })
  // isActive: boolean
  //
  // @Expose()
  // @ApiProperty({ type: Number })
  // semester: number

  // @Expose()
  // @ApiProperty({ type: Number })
  // isCompulsory: boolean
  //
  // @Expose()
  // @Type(() => GetUserResponseDto)
  // @ApiProperty({ type: GetUserResponseDto })
  // teacher: GetUserResponseDto
  //
  // @Expose()
  // @Type(() => GetGroupResponseDto)
  // @ApiProperty({ type: GetGroupResponseDto })
  // groups: GetGroupResponseDto[]
}
