import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { head, isEmpty } from 'lodash';
import { TransactionDomain } from 'src/domains/transaction.domain';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { FriendRequestType } from 'src/enums/friend-request-type.enum';
import { BaseService } from 'src/libs/base/base.service';
import { FriendRequest } from 'src/models/interfaces/friend_requests.entity';
import { Repository } from 'typeorm';
import { UsersService } from './user.service';
import { FriendType } from 'src/enums/friend-type.enum';
import { faker } from '@faker-js/faker';
import { UserStatus } from 'src/enums/userStatus';
import { EGender } from 'src/enums/gender';

@Injectable()
export class FriendRequestService extends BaseService<FriendRequest> {
  logger = new Logger(FriendRequestService.name);

  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepo: Repository<FriendRequest>,
    private readonly userService: UsersService,
    private readonly transactionDomain: TransactionDomain,
  ) {
    super(friendRequestRepo);
  }

  async sendFriendRequest(payload: { userId: string; friendId: string }) {
    const { userId, friendId } = payload;

    const isFriendExist = await this.userService.existsById(friendId);
    const isUserExist = await this.userService.existsById(userId);

    if (!isUserExist || !isFriendExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    const isRequestExist = await this.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: friendId } },
        { sender: { id: friendId }, receiver: { id: userId } },
      ],
    });

    this.logger.log('isRequestExist: ' + JSON.stringify(isRequestExist));

    if (!isEmpty(isRequestExist?.id)) {
      // * friend request is exist
      if (isRequestExist.status === FriendRequestType.ACCEPTED) {
        throw new ConflictException({
          code: ErrorDictionary.FRIEND_REQUEST_ACCEPTED,
        });
      }

      if (isRequestExist.status === FriendRequestType.PENDING) {
        throw new ConflictException({
          code: ErrorDictionary.FRIEND_REQUEST_PENDING,
        });
      }

      if (isRequestExist.status === FriendRequestType.REJECTED) {
        await this.updateById(isRequestExist.id, {
          status: FriendRequestType.PENDING,
          sender: { id: userId },
          receiver: { id: friendId },
        });

        return {
          id: isRequestExist.id,
        };
      }
    }

    // * friend request not exist
    const friendRequest = await this.create({
      sender: { id: userId },
      receiver: { id: friendId },
      status: FriendRequestType.PENDING,
    });

    return friendRequest;
  }

  async updateFriendRequest(payload: {
    userId: string;
    friendRequestId: string;
    status: FriendRequestType;
  }) {
    const { userId, friendRequestId, status } = payload;

    const isUserExist = await this.userService.existsById(userId);

    if (!isUserExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    const { items, total } = await this.findAndCount({
      where: [
        { id: friendRequestId, sender: { id: userId } },
        { id: friendRequestId, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
    });

    this.logger.log('findAndCount updateFriendRequest: ', items);

    if (total == 1) {
      // * request is not accepted

      const friendRequest = head(items);

      if ((friendRequest.sender.id == userId)) {
        // * user is sender
        // * request only allow to DELETED
        if (status !== FriendRequestType.DELETED) {
          throw new ConflictException({
            code: ErrorDictionary.USER_HAVE_NO_RIGHT,
          });
        }

        await this.softDeleteById(friendRequest.id);

        return {
          id: friendRequest.id,
        };
      }

      // * user is receiver
      // * request only allow to ACCEPTED or REJECTED
      if (status == FriendRequestType.ACCEPTED) {
        const newReq = await this.transactionDomain.withTransaction(
          async (queryRunner) => {
            await queryRunner.manager.update(
              FriendRequest,
              { status: FriendRequestType.ACCEPTED },
              { id: friendRequest.id },
            );

            const newRequest = await queryRunner.manager.save(
              FriendRequest,
              queryRunner.manager.create(FriendRequest, {
                status: FriendRequestType.ACCEPTED,
                sender: { id: userId },
                receiver: { id: friendRequest.sender.id },
              }),
            );

            return newRequest;
          },
        );

        return {
          id: newReq.id,
        };
      }

      await this.updateById(friendRequest.id, {
        status,
      });

      return {
        id: friendRequest.id,
      };
    }

    // * request is already accepted
    // * request accepted only allow to DELETE
    if (status != FriendRequestType.DELETED) {
      throw new ConflictException({
        code: ErrorDictionary.USER_HAVE_NO_RIGHT,
      });
    }

    const deleteReq = await this.transactionDomain.withTransaction(
      async (queryRunner) => {
        await queryRunner.manager.delete(FriendRequest, {
          id: friendRequestId,
          sender: { id: userId },
        });

        await queryRunner.manager.delete(FriendRequest, {
          id: friendRequestId,
          receiver: { id: userId },
        });

        return {
          id: friendRequestId,
        };
      },
    );

    return {
      id: deleteReq.id,
    };
  }

  async isOnFriendList(payload: { userId: string; friendId: string }) {
    const { userId, friendId } = payload;

    const isUserExist = await this.userService.existsById(userId);
    const isFriendExist = await this.userService.existsById(friendId);

    if (!isUserExist || !isFriendExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    const isFriend = await this.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: friendId } },
        { sender: { id: friendId }, receiver: { id: userId } },
      ],
    });

    if (isEmpty(isFriend)) {
      return false;
    }

    return true;
  }

  async getFriendList(payload: {
    userId: string;
    page: number;
    limit: number;
  }) {
    const { userId, page, limit } = payload;

    const isUserExist = await this.userService.existsById(userId);

    if (!isUserExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    const { items, total } = await this.findAndCount({
      where: [{ sender: { id: userId }, status: FriendRequestType.ACCEPTED }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
    };
  }

  async getFriendRequestList(payload: {
    userId: string;
    page: number;
    limit: number;
    type: FriendType;
    status: FriendRequestType;
  }) {
    const { userId, page, limit, type, status } = payload;

    const isUserExist = await this.userService.existsById(userId);

    if (!isUserExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    if (status === FriendRequestType.ACCEPTED) {
      throw new ConflictException({
        code: ErrorDictionary.FRIEND_REQUEST_ACCEPTED,
      });
    }

    const { items, total } = await this.findAndCount({
      where: [
        ...(type === FriendType.RECEIVED && [
          { receiver: { id: userId }, status },
        ]),
        ...(type === FriendType.SENT && [{ sender: { id: userId }, status }]),
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
    };
  }

  async mockFriends(userId: string) {
    const isUserExist = await this.userService.existsBy({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new NotFoundException({
        code: ErrorDictionary.USER_NOTFOUND,
      });
    }

    // * mock 5 friends */
    const result = await this.transactionDomain.withTransaction(
      async (queryRunner) => {
        // * create 5 users
        const users = await Promise.all(
          Array.from({ length: 5 }).map(async () => {
            return await this.userService.create({
              password: faker.internet.password(),
              email: faker.internet.email(),
              phoneNumber: faker.phone.number(),
              name: faker.person.fullName(),
              gender: EGender.UNKNOWN,
              avatar: faker.image.avatar(),
              location: faker.location.city(),
              status: UserStatus.ACTIVE,
            });
          }),
        );

        // * create 5 friend requests
        const friendRequests = await Promise.all(
          users.map(async (user) => {
            return await queryRunner.manager.save(
              FriendRequest,
              queryRunner.manager.create(FriendRequest, {
                sender: { id: userId },
                receiver: { id: user.id },
                status: FriendRequestType.ACCEPTED,
              }),
            );
          }),
        );

        await Promise.all(
          users.map(async (user) => {
            return await queryRunner.manager.save(
              FriendRequest,
              queryRunner.manager.create(FriendRequest, {
                sender: { id: user.id },
                receiver: { id: userId },
                status: FriendRequestType.ACCEPTED,
              }),
            );
          }),
        );

        return { users, friendRequests };
      },
    );
    return result;
  }
}
