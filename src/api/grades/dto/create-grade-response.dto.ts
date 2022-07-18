import { Expose } from 'class-transformer'

export class CreateGradeResponseDto {
  @Expose()
  id: number
}
