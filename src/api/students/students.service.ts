import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { Not, Repository } from 'typeorm'
import { AuthService } from '../../auth/auth.service'
import { TokenDto } from '../../auth/dto/token.dto'
import { STUDENT_REPOSITORY } from '../../constants'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { CreateStudentResponseDto } from './dto/create-student-response.dto'
import { CreateStudentDto } from './dto/create-student.dto'
import { GetStudentResponseDto } from './dto/get-student-response.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { Student } from './entities/student.entity'

export enum StudentColumns {
  ID = 'id',
  DATE_OF_BIRTH = 'dateOfBirth',
  GROUP_ID = 'groupId',
  ORDER_NUMBER = 'orderNumber',
  EDEBO_ID = 'edeboId',
  IS_FULL_TIME = 'isFullTime',
}

export const STUDENT_COLUMN_LIST = enumToArray(StudentColumns)
export const STUDENT_COLUMNS = enumToObject(StudentColumns)

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    @Inject(forwardRef(() => AuthService))
    private studentsRepository: Repository<Student>,
    private authService: AuthService,
  ) {}

  async create(createStudentDto: CreateStudentDto, tokenDto?: TokenDto): Promise<CreateStudentResponseDto> {
    const { sub, role } = tokenDto || {}
    if (
      await this.studentsRepository
        .createQueryBuilder()
        .where(`LOWER(edeboId) = LOWER(:edeboId)`, { edeboId: createStudentDto.edeboId })
        .getOne()
    ) {
      throw new BadRequestException(`This student edeboId: ${createStudentDto.edeboId} already exist.`)
    }

    const student = await this.studentsRepository.create(createStudentDto).save({
      data: {
        id: sub,
      },
    })
    return plainToClass(CreateStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  selectStudents() {
    return this.studentsRepository.createQueryBuilder()
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: StudentColumns,
    orderBy: 'ASC' | 'DESC',
    group: string,
    orderNumber: string,
    edeboId: string,
    isFullTime: boolean,
    token: TokenDto,
  ) {
    orderByColumn = orderByColumn || StudentColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(STUDENT_COLUMN_LIST, orderByColumn)

    const query = this.selectStudents()

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(Student.group), LOWER(Student.orderNumber), LOWER(Student.edeboId), LOWER(Student.isFullTime)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (group) {
      query.andWhere(`LOWER(User.group) LIKE LOWER('%${group}%')`)
    }

    if (orderNumber) {
      query.andWhere(`LOWER(User.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }

    if (edeboId) {
      query.andWhere(`LOWER(User.edeboId) LIKE LOWER('%${edeboId}%')`)
    }

    if (isFullTime) {
      query.andWhere(`LOWER(User.isFullTime) LIKE '%${isFullTime}%'`)
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetStudentResponseDto, query, options)
  }

  async findOne(id: number, token?: TokenDto): Promise<GetStudentResponseDto> {
    const { sub, role } = token || {}
    const student = await this.selectStudents().andWhere({ id }).getOne()

    if (!student) {
      throw new NotFoundException(`Not found user id: ${id}`)
    }

    return plainToClass(GetStudentResponseDto, student)
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, { sub, role }: TokenDto): Promise<UpdateResponseDto> {
    if (
      await this.studentsRepository
        .createQueryBuilder()
        .where(`LOWER(edeboId) = LOWER(:edeboId)`, { edeboId: updateStudentDto.edeboId })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`This student edeboId: ${updateStudentDto.edeboId} already exist.`)
    }

    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }

    Object.assign(student, updateStudentDto)

    try {
      await student.save({
        data: {
          student,
        },
      })
    } catch (e) {
      throw new NotAcceptableException("Can't save student. " + e.message)
    }
    return {
      success: true,
    }
  }

  async remove(id: number, userId?: number) {
    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }

    await this.studentsRepository.remove(student, {
      data: {
        id: userId,
      },
    })

    return {
      success: true,
    }
  }
}
