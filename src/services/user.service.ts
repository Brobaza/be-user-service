import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { get } from 'lodash';
import { CacheDomain } from 'src/domains/cache.domain';
import { EGender } from 'src/enums/gender';
import { QueueTopic } from 'src/enums/queue-topic.enum';
import { RedisKey } from 'src/enums/redis-key.enum';
import { Role } from 'src/enums/role.enum';
import { UserStatus } from 'src/enums/userStatus';
import { CreateUserRequest, UpdateUserRequest } from 'src/gen/user.service';
import { BaseService } from 'src/libs/base/base.service';
import { User } from 'src/models/interfaces/user.entity';
import { ProducerService } from 'src/queue/base/producer.base-queue';
import { avatarUrlDemo } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { UserAboutService } from './user_about.service';

@Injectable()
export class UsersService extends BaseService<User> implements OnModuleInit {
  logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly cacheDomain: CacheDomain,
    private readonly producerService: ProducerService,
    private readonly userAboutService: UserAboutService,
  ) {
    super(userRepo);
  }

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const exists = await this.userRepo.existsBy({
      role: Role.ADMIN,
    });
    if (!exists) {
      await this.userRepo.save(
        this.userRepo.create({
          name: 'Admin',
          avatar:
            'https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp',
          email: '123nguyenbahoangkien123@gmail.com',
          phoneNumber: '0946380928',
          address: '123 Nguyen Ba Hoang Kien',
          about: {
            workRole: 'Admin manager',
            company: 'Gleichner, Mueller and Tromp',
            school: 'Nikolaus - Leuschke',
            country: 'Vietnam',
            totalFollowers: 1947,
            totalFollowing: 9124,
            quote:
              'Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..',
            facebook: 'https://www.facebook.com/caitlyn.kerluke',
            twitter: 'https://www.instagram.com/caitlyn.kerluke',
            linkedin: 'https://www.linkedin.com/in/caitlyn.kerluke',
            instagram: 'https://www.twitter.com/caitlyn.kerluke',
          },
          isPublic: true,
          gender: '',
          status: UserStatus.ACTIVE,
          password: '12341234',
          role: Role.ADMIN,
        }),
      );
    }
  }

  async setTakenEmail(email: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().sadd(RedisKey.EMAILS, email),
      this.cacheDomain.getRedisClient().srem(RedisKey.AVAILABLE_EMAILS, email),
    ]);
  }

  async removeTakenEmail(email: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().srem(RedisKey.EMAILS, email),
      this.cacheDomain.getRedisClient().sadd(RedisKey.AVAILABLE_EMAILS, email),
    ]);
  }

  async setAvailableEmail(email: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().sadd(RedisKey.AVAILABLE_EMAILS, email),
      this.cacheDomain.getRedisClient().srem(RedisKey.EMAILS, email),
    ]);
  }

  async removeAvailableEmail(email: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().srem(RedisKey.AVAILABLE_EMAILS, email),
      this.cacheDomain.getRedisClient().sadd(RedisKey.EMAILS, email),
    ]);
  }

  async isTakenEmail(email: string) {
    const availableEmail = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.AVAILABLE_EMAILS, email);
    if (availableEmail) return false;

    const val = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.EMAILS, email);
    if (val) return true;

    const count = await this.userRepo.countBy({ email });
    if (count > 0) {
      await this.setTakenEmail(email);
      return true;
    }

    await this.setAvailableEmail(email);
    return false;
  }

  async isTakenPhone(phone: string) {
    const availablePhone = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.AVAILABLE_PHONES, phone);
    if (availablePhone) return false;

    const val = await this.cacheDomain
      .getRedisClient()
      .sismember(RedisKey.PHONES, phone);
    if (val) return true;

    const count = await this.userRepo.countBy({ phoneNumber: phone });
    if (count > 0) {
      await this.setTakenPhone(phone);
      return true;
    }

    await this.setAvailablePhone(phone);
    return false;
  }

  async setTakenPhone(phone: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().sadd(RedisKey.PHONES, phone),
      this.cacheDomain.getRedisClient().srem(RedisKey.AVAILABLE_PHONES, phone),
    ]);
  }

  async removeTakenPhone(phone: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().srem(RedisKey.PHONES, phone),
      this.cacheDomain.getRedisClient().sadd(RedisKey.AVAILABLE_PHONES, phone),
    ]);
  }

  async setAvailablePhone(phone: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().sadd(RedisKey.AVAILABLE_PHONES, phone),
      this.cacheDomain.getRedisClient().srem(RedisKey.PHONES, phone),
    ]);
  }

  async removeAvailablePhone(phone: string) {
    await Promise.all([
      this.cacheDomain.getRedisClient().srem(RedisKey.AVAILABLE_PHONES, phone),
      this.cacheDomain.getRedisClient().sadd(RedisKey.PHONES, phone),
    ]);
  }

  async getUserByUsername(username: string) {
    if (await this.isTakenEmail(username)) {
      const user = await this.findOne({
        where: { email: username },
      });

      return user;
    }

    if (await this.isTakenPhone(username)) {
      const user = await this.findOne({
        where: { phoneNumber: username },
      });

      return user;
    }

    return null;
  }

  async createUser({
    name,
    phoneNumber,
    email,
    gender,
    password,
    location,
  }: CreateUserRequest) {
    const randomAvatarIndex = Math.floor(Math.random() * avatarUrlDemo.length);
    const avatar = avatarUrlDemo[randomAvatarIndex];

    const user = await this.create({
      name,
      phoneNumber,
      email,
      gender,
      password,
      avatar,
      location,
      status: UserStatus.ACTIVE,
    });
    const userAbout = await this.userAboutService.createUserAbout(user.id);

    await this.setTakenEmail(email);
    await this.setTakenPhone(phoneNumber);

    await this.producerService.produce({
      topic: QueueTopic.SYNC_STREAM_USER,
      messages: [
        {
          value: JSON.stringify({
            userId: user.id,
            name: name,
            avatar: avatar,
          }),
        },
      ],
    });

    return {
      ...user,
      about: userAbout,
    };
  }

  async updateUser(id: string, request: UpdateUserRequest) {
    const userAboutRequest = get(request, 'about', {});

    await this.updateById(id, {
      ...request,
      status: get(request, 'status', UserStatus.ACTIVE) as UserStatus,
      about: {
        ...userAboutRequest,
      },
    });
  }

  parseToProtocBufUser(user: any) {
    return {
      id: get(user, 'id', ''),
      name: get(user, 'name', ''),
      avatar: get(user, 'avatar', ''),
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
      location: get(user, 'location', ''),
    };
  }
}
