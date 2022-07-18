import { DATABASE_CONNECTION, GRADE_REPOSITORY } from '../../../constants'
import { Connection } from 'typeorm'
import { Grade } from './grade.entity'

export const gradeProviders = [
  {
    provide: GRADE_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Grade),
    inject: [DATABASE_CONNECTION],
  },
]
