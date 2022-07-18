import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetStudentResponseDto } from '../../students/dto/get-student-response.dto'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'

export class GetGradeResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  grade: number

  @Expose()
  @Type(() => GetStudentResponseDto)
  @ApiProperty({ type: GetStudentResponseDto })
  student: GetStudentResponseDto

  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  course: GetCourseResponseDto
}
