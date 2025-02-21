import {
  IsString,
  IsOptional,
  IsStrongPassword,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';
import { EGender } from 'src/enums/gender';

export class createUserDto {
  @IsString()
  displayName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  gender?: EGender;

  @IsStrongPassword()
  password: string;
}
