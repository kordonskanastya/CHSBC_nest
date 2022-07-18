import * as faker from 'faker'

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION'
export const USER_REPOSITORY = 'USER_REPOSITORY'
export const GROUP_REPOSITORY = 'GROUP_REPOSITORY'
export const LOGGER_REPOSITORY = 'LOGGER_REPOSITORY'
export const STUDENT_REPOSITORY = 'STUDENT_REPOSITORY'
export const COURSE_REPOSITORY = 'COURSE_REPOSITORY'
export const GRADE_REPOSITORY = 'GRADE_REPOSITORY'

export const FAKE_EMAIL = faker.internet.email()
export const FAKE_PASSWORD = faker.internet.password(7, true)
export const GradingList = { 0: 'High', 1: 'Moderate', 2: 'Low', 3: 'None' }
