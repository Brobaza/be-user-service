import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { get } from 'lodash';
import { CacheDomain } from 'src/domains/cache.domain';
import { EGender } from 'src/enums/gender';
import { RedisKey } from 'src/enums/redis-key.enum';
import { Role } from 'src/enums/role.enum';
import { UserStatus } from 'src/enums/userStatus';
import { CreateUserRequest } from 'src/gen/user.service';
import { BaseService } from 'src/libs/base/base.service';
import { User } from 'src/models/interfaces/user.entity';
import { avatarUrlDemo } from 'src/utils/constants';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseService<User> implements OnModuleInit {
  logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly cacheDomain: CacheDomain,
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
          country: 'Vietnam',
          address: '123 Nguyen Ba Hoang Kien',
          state: 'HCM',
          city: 'HCM',
          zipCode: '700000',
          about: 'Admin account',
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

    const user = await this.create({
      name,
      phoneNumber,
      email,
      gender,
      password,
      avatar: avatarUrlDemo[randomAvatarIndex],
      location,
      status: UserStatus.ACTIVE,
    });

    await this.setTakenEmail(email);
    await this.setTakenPhone(phoneNumber);

    return user;
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
