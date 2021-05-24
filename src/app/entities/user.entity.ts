// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hashPassword } from '@foal/core';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  USER = "Usuario",
  CREATOR = "Creador",
  FOUNDER = "Dueño"
}

/**
 * @class User representa la tabla usuario en la base de datos.
 * @instance de la clase son las atributos de la tabla usuario.
 */
@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 80,
    unique: true
  })
  email: string;

  @Column({
    type: "nvarchar",
    length: 400
  })
  password: string;

  @Column({
    type: "char",
    length: 20,
    unique: true
  })
  phone_number: string;

  @Column({
    type: "varchar",
    length: 50,
    unique: true
  })
  nickname: string;

  @Column({
    type: "char",
    length: 40,
  })
  name: string;

  @Column({
    type: "char",
    length: 50,
    nullable: true
  })
  last_name: string;

  @Column({
    type: "set",
    enum: UserRole,
    default: [UserRole.USER]
  })
  user_role: UserRole[];

  async setPassword(password: string) {
    this.password = await hashPassword(password);
  }
}

export { DatabaseSession } from '@foal/typeorm';