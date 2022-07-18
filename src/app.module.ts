import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './api/users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { configService } from './config/config.service'
import { AuthModule } from './auth/auth.module'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggersModule } from './api/loggers/loggers.module'
import { LoggerMiddleware } from './utils/logger.middleware'
import { LoggerModule } from 'nestjs-pino'
import { StudentsModule } from './api/students/students.module'
import * as fs from 'fs'
import { GroupsModule } from './api/groups/groups.module'
import { CoursesModule } from './api/courses/courses.module'
import { GradesModule } from './api/grades/grades.module'

const stream = configService.getEnvName() === 'local' ? process.stdout : fs.createWriteStream('my-file.log')
const logLevel = configService.getEnvName() === 'local' ? 'debug' : 'error'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: [
        {
          prettyPrint: {
            colorize: true, // colorizes the log
            translateTime: 'yyyy-dd-mm, h:MM:ss TT',
            ignore: 'req.headers,context',
          },

          level: logLevel,
        },
        stream,
      ],
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    LoggersModule,
    GroupsModule,
    StudentsModule,
    CoursesModule,
    GradesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
