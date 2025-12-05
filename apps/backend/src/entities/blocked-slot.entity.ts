import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('blocked_slots')
export class BlockedSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  time: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: 'admin' })
  blockedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
