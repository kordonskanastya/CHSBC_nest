import { IsNumber, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateGradeDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  courseId: number

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({ example: 1 })
  grade: number
}
