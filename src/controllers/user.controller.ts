import { Controller, Get, Logger } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { get, isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { EGender } from 'src/enums/gender';
import {
  CreateUserRequest,
  GetUserRequest,
  GetUserResponse,
  ManageUserResponse,
  UpdateUserRequest,
  UserServiceController,
  UserServiceControllerMethods,
} from 'src/gen/user.service';
import { UsersService } from 'src/services/user.service';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    const { id } = request;
    this.logger.log(`>>> get user: ${id}`);
    const user = await this.usersService.findById(id);

    return {
      id: get(user, 'id', ''),
      displayName: get(user, 'displayName', ''),
      photoUrl: get(user, 'photoUrl', ''),
      phoneNumber: get(user, 'phoneNumber', ''),
      country: get(user, 'country', ''),
      address: get(user, 'address', ''),
      state: get(user, 'state', ''),
      city: get(user, 'city', ''),
      zipCode: get(user, 'zipCode', ''),
      about: get(user, 'about', ''),
      role: get(user, 'role', ''),
      isPublic: get(user, 'isPublic', false),
      email: get(user, 'email', ''),
      gender: get(user, 'gender', EGender.UNKNOWN),
    };
  }

  async createUser(request: CreateUserRequest): Promise<ManageUserResponse> {
    const { displayName, phoneNumber, email, gender, password } = request;
    this.logger.log(`>>> create user: ${displayName}`);

    try {
      const user = await this.usersService.create({
        displayName,
        phoneNumber,
        email,
        gender,
        password,
      });

      return {
        id: get(user, 'id', ''),
        message: 'User created successfully',
        code: '200',
        errMessage: '',
      };
    } catch (err) {
      return {
        id: '',
        message: 'Failed to create user',
        code: '400',
        errMessage: err.message,
      };
    }
  }

  async updateUser(request: UpdateUserRequest): Promise<ManageUserResponse> {
    this.logger.log(`>>> update user: ${request.id}`);

    const id = get(request, 'id', '');

    if (isEmpty(id)) {
      return {
        id: '',
        message: 'Failed to update user',
        code: '400',
        errMessage: 'User id is required',
      };
    }

    try {
      await this.usersService.updateById(id, request);

      return {
        id: request.id,
        message: 'User updated successfully',
        code: '200',
        errMessage: '',
      };
    } catch (err) {
      return {
        id: request.id,
        message: 'Failed to update user',
        code: '400',
        errMessage: err.message,
      };
    }
  }
}
