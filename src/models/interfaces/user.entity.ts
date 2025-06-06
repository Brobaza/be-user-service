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
  OneToOne,
} from 'typeorm';
import { UserAddress } from './user_address.entity';
import { UserAbout } from './user.about';
import { FriendRequest } from './friend_requests.entity';

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

  @ApiProperty({ example: '90210 Broadway Blvd' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ example: 'vn' })
  @Column({ nullable: true })
  location?: string;

  @OneToOne(() => UserAbout, (userAbout) => userAbout.user)
  about: UserAbout;

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

  @OneToMany(() => User, (user) => user.friendRequest)
  friendRequest: FriendRequest[];

  @OneToMany(() => User, (user) => user.friendRequest)
  friendRequestReceived: FriendRequest[];

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  comparePassword(password: string) {
    return compareSync(password, this.password);
  }
}
