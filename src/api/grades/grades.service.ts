import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GRADE_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Grade } from './entities/grade.entity'
import { plainToClass } from 'class-transformer'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'
import { TokenDto } from '../../auth/dto/token.dto'
import { Course } from '../courses/entities/course.entity'
import { Student } from '../students/entities/student.entity'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { GetGradeResponseDto } from './dto/get-grade-response.dto'
import { Group } from '../groups/entities/group.entity'
import { GroupsColumns } from '../groups/groups.service'

export enum GradeColumns {
  ID = 'Grade.id',
  COURSE_ID = 'Course.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'Grade.grade',
}

export const GRADE_COLUMN_LIST = enumToArray(GradeColumns)
export const GRADE_COLUMNS = enumToObject(GradeColumns)

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const student = await Student.findOne(createGradeDto.studentId)
    const course = await Course.findOne(createGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`This student id: ${createGradeDto.studentId} not found.`)
    }

    if (!course) {
      throw new BadRequestException(`This course id: ${createGradeDto.courseId} not found.`)
    }

    const grade = await this.gradeRepository
      .create({
        ...createGradeDto,
        student,
        course,
      })
      .save({ data: { id: sub } })

    return plainToClass(CreateGroupResponseDto, grade, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: GradeColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    courseId: number,
    grade: number,
  ) {
    orderByColumn = orderByColumn || GradeColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADE_COLUMN_LIST, orderByColumn)

    const query = this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.group', 'Group')
    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ',"studentId","courseId","grade") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (grade) {
      query.andWhere(`grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    query.orderBy(`${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGradeResponseDto, query, options)
  }

  async findOne(id: number) {
    const student = await Student.findOne(id)

    if (!student) {
      throw new BadRequestException(`This student id: ${id} not found.`)
    }

    const grades = await this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere('Student.id=:id', { id })
      .getMany()
    if (!grades) {
      throw new NotFoundException(`Not found grades id: ${id}`)
    }
    return plainToClass(GetGradeResponseDto, grades, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const student = await Student.findOne(id)
    const course = await Course.findOne(updateGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`This student id: ${id} not found.`)
    }

    if (!course) {
      throw new BadRequestException(`This course id: ${updateGradeDto.courseId} not found.`)
    }

    const grade = await this.gradeRepository
      .createQueryBuilder('Grade')
      .where('Grade.studentId=:studentId', { studentId: id })
      .andWhere('Grade.courseId=:courseId', { courseId: updateGradeDto.courseId })
      .getOne()

    if (!grade) {
      throw new BadRequestException(`This grade  not found.`)
    }

    Object.assign(grade, updateGradeDto)

    try {
      await grade.save({ data: { id: sub } })
    } catch (e) {
      throw new NotAcceptableException("Can't save grade. " + e.message)
    }

    return {
      success: true,
    }
  }

  async remove(id: number, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const grade = await this.gradeRepository.findOne(id)

    if (!grade) {
      throw new NotFoundException(`Not found grade id: ${id}`)
    }

    await this.gradeRepository.remove(grade, {
      data: {
        id: sub,
      },
    })

    return {
      success: true,
    }
  }
  async dropdownGroup(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', groupName: string) {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = Group.createQueryBuilder('Group').leftJoin('Group.courses', 'Course').groupBy('Group.id')
    if (groupName) {
      query.andWhere('LOWER(Group.name) LIKE LOWER(:name)', { name: `%${groupName}%` })
    }
    query.orderBy(`Group.${orderByColumn}`, orderBy).having('Count(Course.id)>0')
    return await paginateAndPlainToClass(CreateGroupResponseDto, query, options)
  }
}
