import { ApiProperty } from '@nestjs/swagger';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { Role } from 'src/enums/role.enum';
import { UserStatus } from 'src/enums/userStatus';
import { BaseEntity } from 'src/libs/base/base.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';
import { UserAddress } from './user_address.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty({ example: 'Jaydon Frankie' })
  @Column()
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.png' })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ example: '+1 416-555-0198' })
  @Column({ unique: true })
  phoneNumber: string;

  @ApiProperty({ example: 'Canada' })
  @Column({ nullable: true })
  country?: string;

  @ApiProperty({ example: '90210 Broadway Blvd' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ example: 'California' })
  @Column({ nullable: true })
  state?: string;

  @ApiProperty({ example: 'San Francisco' })
  @Column({ nullable: true })
  city?: string;

  @ApiProperty({ example: '94116' })
  @Column({ nullable: true })
  zipCode?: string;

  @ApiProperty({ example: 'vn' })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ example: 'Short bio about the user' })
  @Column({ nullable: true })
  about?: string;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isPublic?: boolean;

  @ApiProperty({ example: 'admin001@gmail.com' })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ example: 'Male' })
  @Column({ nullable: true })
  gender?: string;

  @ApiProperty({ example: '@demo1' })
  @Column()
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  beforeSave() {
    if (this.password) {
      this.password = this.hashPassword(this.password);
    }
  }

  @ApiProperty({ example: '2021-08-01T00:00:00.000Z' })
  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt: Date;

  @ApiProperty({ example: '2021-08-01T00:00:00.000Z' })
  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @ApiProperty({ enum: UserStatus })
  @Column({
    type: 'enum',
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: Object.values(Role),
    default: Role.CLIENT,
  })
  role: Role;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  comparePassword(password: string) {
    return compareSync(password, this.password);
  }
}
