import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsBoolean,
} from 'class-validator';
import { EGender } from 'src/enums/gender';

export class UpdateUserDto {
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  photoURL?: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  gender?: EGender;
}
