import { Controller, Logger } from '@nestjs/common';
import { filter, get, isEmpty, map } from 'lodash';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { EGender } from 'src/enums/gender';
import {
  CreateAddressRequest,
  CreateUserRequest,
  DeleteAddressRequest,
  GetAddressesRequest,
  GetAddressesResponse,
  GetAddressRequest,
  GetAddressResponse,
  GetAllRelatedFriendRequest,
  GetAllRelatedFriendResponse,
  GetDefaultAddressRequest,
  GetDefaultAddressResponse,
  GetUserByUserNameRequest,
  GetUserRequest,
  GetUserResponse,
  ManageAddressResponse,
  ManageUserResponse,
  UpdateAddressRequest,
  UpdateUserRequest,
  UserServiceController,
  UserServiceControllerMethods,
} from 'src/gen/user.service';
import { User } from 'src/models/interfaces/user.entity';
import { UserAddressService } from 'src/services/address.service';
import { UsersService } from 'src/services/user.service';
import { convertToUserProto } from 'src/utils/converters';
import { compactInObject } from 'src/utils/helpers';
import { DeepPartial } from 'typeorm';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userAddressService: UserAddressService,
  ) {}

  async getAllRelatedFriend(
    request: GetAllRelatedFriendRequest,
  ): Promise<GetAllRelatedFriendResponse> {
    const { userId } = request;
    this.logger.log(`>>> get all related friend: ${userId}`);

    try {
      const { items } = await this.usersService.findAndCount({
        skip: 0,
        take: 100,
        relations: ['about'],
      });

      return {
        friends: map(
          filter(items, (i) => i.id !== userId),
          (item) => convertToUserProto(item),
        ),
        metadata: {
          id: '',
          message: 'Users found',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        friends: [],
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async getAddresses(
    request: GetAddressesRequest,
  ): Promise<GetAddressesResponse> {
    try {
      const resp = await this.userAddressService.findAll(request);

      return {
        addresses: map(resp.items, (item) =>
          this.userAddressService.parseToProtocModel(item),
        ),
        total: get(resp, 'total', 0),
        metadata: {
          id: '',
          message: '',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        addresses: [],
        total: 0,
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async getAddress(request: GetAddressRequest): Promise<GetAddressResponse> {
    const { id: addressId, userId } = request;

    try {
      const resp = await this.userAddressService.validate({
        addressId,
        userId,
      });

      return {
        address: this.userAddressService.parseToProtocModel(resp),
        metadata: {
          id: '',
          message: '',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        address: this.userAddressService.getDefaultProtocModel(),
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async deleteAddress(
    request: DeleteAddressRequest,
  ): Promise<ManageAddressResponse> {
    const { id: addressId, userId } = request;
    try {
      await this.userAddressService.validate({ addressId, userId });

      await this.userAddressService.softDelete({ id: addressId });

      return {
        id: addressId,
        metadata: {
          id: '',
          message: 'Address deleted successfully',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        id: '',
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async createAddress(
    request: CreateAddressRequest,
  ): Promise<ManageAddressResponse> {
    try {
      const { id } = await this.userAddressService.createUserAddress(request);

      return {
        id,
        metadata: {
          id: '',
          message: 'Address created successfully',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        id: '',
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async updateAddress(
    request: UpdateAddressRequest,
  ): Promise<ManageAddressResponse> {
    try {
      const { id } = await this.userAddressService.updateUserAddress(request);

      return {
        id,
        metadata: {
          id: '',
          message: 'Address updated successfully',
          code: '200',
          errMessage: '',
        },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        id: '',
        metadata: {
          id: '',
          code: JSON.stringify(get(error, 'response.status', 500)),
          message: get(error, 'response.code', 'Internal Server Error'),
          errMessage: error.message,
        },
      };
    }
  }

  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    const { id } = request;
    this.logger.log(`>>> get user: ${id}`);
    const user = await this.usersService.findById(id, 'about');

    return convertToUserProto(user);
  }

  async createUser(request: CreateUserRequest): Promise<ManageUserResponse> {
    const { name, phoneNumber, email, gender, password, location } = request;
    this.logger.log(`>>> create user: ${name}`);

    try {
      const user = await this.usersService.createUser({
        name,
        phoneNumber,
        email,
        gender,
        password,
        location,
      });

      return {
        id: get(user, 'id', ''),
        message: 'User created successfully',
        code: '200',
        errMessage: '',
      };
    } catch (error) {
      this.logger.error(error);

      return {
        id: '',
        code: JSON.stringify(get(error, 'response.status', 500)),
        message: get(error, 'response.code', 'Internal Server Error'),
        errMessage: error.message,
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
      await this.usersService.updateUser(
        id,
        compactInObject<UpdateUserRequest>(request),
      );

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

  async isTakenEmail(request: {
    email: string;
  }): Promise<{ isTaken: boolean }> {
    const { email } = request;
    this.logger.log(`>>> check email: ${email}`);

    const isTaken = await this.usersService.isTakenEmail(email);

    return { isTaken };
  }

  async isTakenPhoneNumber(request: {
    phoneNumber: string;
  }): Promise<{ isTaken: boolean }> {
    const { phoneNumber } = request;
    this.logger.log(`>>> check phone number: ${phoneNumber}`);

    const isTaken = await this.usersService.isTakenPhone(phoneNumber);

    return { isTaken };
  }

  async getUserByUserName(
    request: GetUserByUserNameRequest,
  ): Promise<ManageUserResponse> {
    const { username, password } = request;
    const user = await this.usersService.getUserByUsername(username);

    if (isEmpty(user)) {
      return {
        id: '',
        message: 'User not found',
        code: '404',
        errMessage: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      };
    }

    if (!user.comparePassword(password)) {
      return {
        id: '',
        message: 'User not found',
        code: '404',
        errMessage: ErrorDictionary.USERNAME_OR_PASSWORD_INCORRECT,
      };
    }

    return {
      id: get(user, 'id', ''),
      message: 'User found',
      code: '200',
      errMessage: '',
    };
  }

  async getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Promise<GetDefaultAddressResponse> {
    const { userId } = request;
    this.logger.log(`>>> get default address: ${userId}`);

    try {
      const resp = await this.userAddressService.getDefaultAddress(userId);

      return {
        address: this.userAddressService.parseToProtocModel(resp),
        metadata: {
          id: '',
          message: 'Default address found',
          code: '200',
          errMessage: '',
        },
      };
    } catch (err) {
      return {
        address: this.userAddressService.getDefaultProtocModel(),
        metadata: {
          id: '',
          message: 'Default address not found',
          code: '404',
          errMessage: err.message,
        },
      };
    }
  }
}
