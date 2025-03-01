import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from 'src/enums/address-type.enum';
import { BaseEntity } from 'src/libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_addresses' })
export class UserAddress extends BaseEntity {
  @ApiProperty({ example: true })
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({ example: 'Canada' })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({ example: '90210 Broadway Blvd' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ example: AddressType.HOME })
  @Column({
    type: 'enum',
    enum: Object.values(AddressType),
    default: AddressType.HOME,
  })
  type: AddressType;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
