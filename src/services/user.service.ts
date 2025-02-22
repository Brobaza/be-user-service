import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/libs/base/base.service';
import { User } from 'src/models/interfaces/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseService<User> {
  logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  async isTakenEmail(email: string) {
    // const availableEmail = await this.cacheDomain
    //   .getRedisClient()
    //   .sismember(RedisKey.AVAILABLE_EMAILS, email);
    // if (availableEmail) return false;

    // const val = await this.cacheDomain
    //   .getRedisClient()
    //   .sismember(RedisKey.EMAILS, email);
    // if (val) return true;

    const count = await this.userRepo.countBy({ email });
    if (count > 0) {
      // await this.setTakenEmail(email);
      return true;
    }

    // await this.setAvailableEmail(email);
    return false;
  }

  async isTakenPhoneNumber(phoneNumber: string) {
    // const availableEmail = await this.cacheDomain
    //   .getRedisClient()
    //   .sismember(RedisKey.AVAILABLE_EMAILS, email);
    // if (availableEmail) return false;

    // const val = await this.cacheDomain
    //   .getRedisClient()
    //   .sismember(RedisKey.EMAILS, email);
    // if (val) return true;

    const count = await this.userRepo.countBy({ phoneNumber });
    if (count > 0) {
      // await this.setTakenEmail(email);
      return true;
    }

    // await this.setAvailableEmail(email);
    return false;
  }

  async getUserByUsername(username: string) {
    if (await this.isTakenEmail(username)) {
      const user = await this.userRepo.findOne({
        where: { email: username },
      });

      return user;
    }

    if (await this.isTakenPhoneNumber(username)) {
      const user = await this.userRepo.findOne({
        where: { phoneNumber: username },
      });

      return user;
    }

    return null;
  }
}
