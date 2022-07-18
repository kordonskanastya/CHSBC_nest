import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { GradeColumns, GradesService } from './grades.service'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CreateGradeResponseDto } from './dto/create-grade-response.dto'
import { Entities } from '../common/enums'
import { capitalize } from '../../utils/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { GetGradeResponseDto } from './dto/get-grade-response.dto'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'

@Controller(Entities.GRADES)
@ApiTags(capitalize(Entities.GRADES))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @MinRole(ROLE.TEACHER)
  @ApiCreatedResponse({ type: CreateGradeResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Request() req, @Body() createGradeDto: CreateGradeDto): Promise<CreateGradeResponseDto> {
    return await this.gradesService.create(createGradeDto, req.user)
  }

  @Get()
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetGradeResponseDto, {
    description: 'Find all grades',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: GradeColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'studentId', required: false },
    { name: 'courseId', required: false },
    { name: 'grade', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: GradeColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('studentId') studentId: number,
    @Query('courseId') courseId: number,
    @Query('grade') grade: number,
  ) {
    return await this.gradesService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GRADES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      studentId,
      courseId,
      grade,
    )
  }

  @Get('/student/:id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  async findOne(@Param('id') id: string) {
    return await this.gradesService.findOne(+id)
  }

  @Patch('/student/:id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  async update(@Request() req, @Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return await this.gradesService.update(+id, updateGradeDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return await this.gradesService.remove(+id, req.user)
  }

  @Get('dropdown/group-name')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(CreateGroupResponseDto, {
    description: 'get dropdown list',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'groupName', required: false },
  ])
  async dropdownGroupName(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('groupName') groupName: string,
  ) {
    return await this.gradesService.dropdownGroup(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GRADES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      groupName,
    )
  }
}
