import { Controller, Logger } from '@nestjs/common';
import { get, isEmpty, map } from 'lodash';
import { Observable } from 'rxjs';
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
import { UserAddressService } from 'src/services/address.service';
import { UsersService } from 'src/services/user.service';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userAddressService: UserAddressService,
  ) {}

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
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));

      return {
        addresses: [],
        total: 0,
        metadata: {
          id: '',
          message: '',
          errMessage: '',
          code: '500',
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
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));

      return {
        address: this.userAddressService.getDefaultProtocModel(),
        metadata: {
          id: '',
          message: JSON.stringify(err),
          code: '500',
          errMessage: err?.message || '',
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
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));

      return {
        id: '',
        metadata: {
          id: '',
          message: JSON.stringify(err),
          code: '500',
          errMessage: err?.message || '',
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
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));

      return {
        id: '',
        metadata: {
          id: '',
          message: JSON.stringify(err),
          code: '500',
          errMessage: err?.message || '',
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
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));

      return {
        id: '',
        metadata: {
          id: '',
          message: JSON.stringify(err),
          code: '500',
          errMessage: err?.message || '',
        },
      };
    }
  }

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
      await this.usersService.updateById(id, request as any);

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
    this.logger.log(`>>> get user by username: ${username}`);

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
