import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/libs/base/base.entity';

@Entity({ name: 'user_about' })
export class UserAbout extends BaseEntity {
  @OneToOne(() => User, (user) => user.about, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'CTO' })
  @Column({ nullable: true })
  workRole: string;

  @ApiProperty({ example: 'Company' })
  @Column({ nullable: true })
  company: string;

  @ApiProperty({ example: 'Nikolaus - Leuschke' })
  @Column({ nullable: true })
  school: string;

  @ApiProperty({ example: 'Company' })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true })
  totalFollowers: number;

  @ApiProperty({ example: 5 })
  @Column({ nullable: true })
  totalFollowing: number;

  @ApiProperty({ example: 'Quote' })
  @Column({ nullable: true })
  quote: string;

  @ApiProperty({ example: 'https://example.com/website' })
  @Column({ nullable: true })
  facebook: string;

  @ApiProperty({ example: 'https://example.com/website' })
  @Column({ nullable: true })
  twitter: string;

  @ApiProperty({ example: 'https://example.com/website' })
  @Column({ nullable: true })
  linkedin: string;

  @ApiProperty({ example: 'https://example.com/website' })
  @Column({ nullable: true })
  instagram: string;
}
