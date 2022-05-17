import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'
import { Expose } from 'class-transformer'

export class GetUserResponseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  firstName: string

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  lastName: string

  @Expose()
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  email: string

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  role: string

  @Expose()
  @IsDate()
  @ApiProperty({ type: Date })
  updated: Date

  @Expose()
  @IsDate()
  @ApiProperty({ type: Date })
  created: Date
}
