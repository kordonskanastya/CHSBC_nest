import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GRADE_HISTORY_REPOSITORY, GRADE_REPOSITORY, STUDENT_REPOSITORY } from '../../constants'
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
import { Group } from '../groups/entities/group.entity'
import { GroupsColumns } from '../groups/groups.service'
import { GetStudentForGradeDto } from '../students/dto/get-student-for-grade.dto'
import { GradeHistory } from '../grades-history/entities/grades-history.entity'
import { User } from '../users/entities/user.entity'

export enum GradeColumns {
  ID = 'Grade.id',
  COURSE_ID = 'Course.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'Grade.grade',
  CREATED = 'created',
  UPDATED = 'updated',
}

export enum ReasonForChangeGrade {
  EXAM = 'Екзамен',
  RETAKE = 'Перездача',
  MISTAKE = 'Помилкове введення оцінки',
}

export const GRADE_COLUMN_LIST = enumToArray(GradeColumns)
export const GRADE_COLUMNS = enumToObject(GradeColumns)

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: Repository<Student>,
    @Inject(GRADE_HISTORY_REPOSITORY)
    private gradeHistoryRepository: Repository<GradeHistory>,
  ) {}

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

    const query = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.courses', 'Course')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Course.grades', 'Grade')
      .leftJoinAndSelect('Student.user', 'User')
    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ',"Student.id","Course.id") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (grade) {
      query.andWhere(`Grade.grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    query.orderBy(`${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetStudentForGradeDto, query, options)
  }

  async findOne(id: number) {
    const student = await Student.findOne(id)

    if (!student) {
      throw new BadRequestException(`Студента з  id: ${id} не знайдено.`)
    }

    const grades = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.courses', 'Course')
      .leftJoinAndSelect('Course.grade', 'Grade')
      .leftJoinAndSelect('Student.user', 'User')
      .andWhere('Student.id=:id', { id })
      .getOne()

    if (!grades) {
      throw new NotFoundException(`Not found grades id: ${id}`)
    }
    return plainToClass(GetStudentForGradeDto, grades, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const student = await Student.findOne(id)
    const course = await Course.findOne(updateGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`Студента з id: ${id} не знайдено .`)
    }

    if (!course) {
      throw new BadRequestException(`Предмета з id: ${updateGradeDto.courseId} не знайдено.`)
    }

    const grade = await this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.courses', 'Course')
      .where('Grade.studentId=:studentId', { studentId: id })
      .andWhere('Course.id=:courseId', { courseId: updateGradeDto.courseId })
      .getOne()

    if (!grade) {
      throw new BadRequestException(`This grade  not found.`)
    }

    Object.assign(grade, updateGradeDto)

    const userChanged = await User.findOne(sub)

    try {
      await grade.save({ data: { id: sub } })
      await this.gradeHistoryRepository
        .create({
          student,
          course,
          userChanged,
          grade: updateGradeDto.grade,
          reasonOfChange: updateGradeDto.reasonForChange,
        })
        .save({ data: { id: sub } })
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
