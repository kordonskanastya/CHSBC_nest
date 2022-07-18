import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { Entities } from '../../common/enums'
import { Grade } from './grade.entity'
import { GetLoggerGradeDto } from '../../loggers/dto/get-logger-grade.dto'

@EventSubscriber()
export class GradeSubscriber extends LoggerSubscriber<Grade> {
  listenTo() {
    return Grade
  }

  getEntityName() {
    return Entities.GRADES
  }

  prepareData(data) {
    return plainToClass(GetLoggerGradeDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
