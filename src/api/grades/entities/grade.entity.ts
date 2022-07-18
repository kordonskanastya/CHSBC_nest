import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Student } from '../../students/entities/student.entity'
import { Course } from '../../courses/entities/course.entity'

@Entity({ name: Entities.GRADES })
export class Grade extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Student)
  @JoinColumn()
  student: Student

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course

  @Column({ default: 0, nullable: false })
  grade: number
}
