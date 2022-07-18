import { Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetLoggerGradeDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  studentId: number

  @Expose()
  @ApiProperty({ type: Number })
  courseId: number

  @Expose()
  @Min(0)
  @Max(100)
  @ApiProperty({ type: Number })
  grade: number
}
