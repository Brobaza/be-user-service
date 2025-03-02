import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { get, isNil } from 'lodash';
import { AddressType } from 'src/enums/address-type.enum';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import {
  Address,
  CreateAddressRequest,
  GetAddressesRequest,
  UpdateAddressRequest,
} from 'src/gen/user.service';
import { BaseService } from 'src/libs/base/base.service';
import { UserAddress } from 'src/models/interfaces/user_address.entity';
import { Repository } from 'typeorm';
import { UsersService } from './user.service';
import { TransactionDomain } from 'src/domains/transaction.domain';

@Injectable()
export class UserAddressService extends BaseService<UserAddress> {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepo: Repository<UserAddress>,
    private readonly userService: UsersService,
    private readonly transactionDomain: TransactionDomain,
  ) {
    super(userAddressRepo);
  }

  async createUserAddress(
    request: CreateAddressRequest,
  ): Promise<{ id: string }> {
    const { userId } = request;

    const user = await this.userService.findById(userId);

    if (isNil(user)) {
      throw new ConflictException({
        message: ErrorDictionary.USER_NOTFOUND,
        code: '422',
      });
    }

    const { total } = await this.findAndCount({
      where: {
        user: { id: userId },
      },
    });

    if (!request.isDefault) {
      const address = await this.create({
        ...request,
        isDefault: total === 0 ? true : false,
        type: request.type as AddressType,
        user: { id: userId },
      });

      return address;
    }

    await this.transactionDomain.withTransaction(async (queryRunner) => {
      await queryRunner.manager.update(
        UserAddress,
        { user: { id: userId } },
        { isDefault: false },
      );

      await queryRunner.manager.save(
        UserAddress,
        queryRunner.manager.create(UserAddress, {
          ...request,
          isDefault: true,
          type: request.type as AddressType,
          user: { id: userId },
        }),
      );
    });
  }

  async validate({
    addressId,
    userId,
  }: {
    addressId: string;
    userId: string;
  }): Promise<UserAddress> {
    return await this.findOneOrFail({
      where: {
        id: addressId,
        user: { id: userId },
      },
    });
  }

  async findAll({
    page,
    limit,
    userId,
  }: GetAddressesRequest): Promise<{ items: UserAddress[]; total: number }> {
    const offset = (page - 1) * limit;

    return await this.findAndCount({
      where: {
        user: { id: userId },
      },
      skip: offset,
      take: limit,
      relations: [
        'category',
        'product_rating',
        'product_variant',
        'product_reviews',
        'product_labels',
        'product_tags',
      ],
    });
  }

  parseToProtocModel(data: UserAddress): Address {
    return {
      id: get(data, 'id', ''),
      isDefault: get(data, 'isDefault', false),
      userId: get(data, 'user.id', ''),
      title: get(data, 'title', ''),
      type: get(data, 'type', AddressType.HOME),
      address: get(data, 'address', ''),
    };
  }

  getDefaultProtocModel(): Address {
    return {
      id: '',
      isDefault: false,
      userId: '',
      title: '',
      type: AddressType.HOME,
      address: '',
    };
  }

  async updateUserAddress(request: UpdateAddressRequest): Promise<{
    id: string;
  }> {
    const { userId, id } = request;

    await this.validate({ addressId: id, userId });

    const user = await this.userService.findById(userId);

    if (isNil(user)) {
      throw new ConflictException({
        message: ErrorDictionary.USER_NOTFOUND,
        code: '422',
      });
    }

    const { total } = await this.findAndCount({
      where: {
        user: { id: userId },
      },
    });

    if (!request.isDefault) {
      await this.updateById(id, {
        ...request,
        isDefault: total === 1 ? true : false,
        type: request.type as AddressType,
        user: { id: userId },
      });

      return { id };
    }

    await this.transactionDomain.withTransaction(async (queryRunner) => {
      await queryRunner.manager.update(
        UserAddress,
        { user: { id: userId } },
        { isDefault: false },
      );

      await queryRunner.manager.update(
        UserAddress,
        { id },
        {
          ...request,
          isDefault: true,
          type: request.type as AddressType,
          user: { id: userId },
        },
      );
    });

    return {
      id,
    };
  }

  async getDefaultAddress(userId: string): Promise<UserAddress> {
    return await this.findOneOrFail({
      where: {
        user: { id: userId },
        isDefault: true,
      },
    });
  }
}
