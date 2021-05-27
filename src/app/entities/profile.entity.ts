import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { User } from './';

@Entity()
export class Profile extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'nvarchar',
    length: 300,
    nullable: true
  })
  picture: string;

  @Column({
    type: 'char',
    length: 50,
    nullable: true
  })
  last_name: string;

  @Column({
    type: 'json',
    nullable: true
  })
  social_media: object;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}
