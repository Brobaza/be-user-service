import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/libs/base/base.service';
import { UserAbout } from 'src/models/interfaces/user.about';
import { Repository } from 'typeorm';

@Injectable()
export class UserAboutService extends BaseService<UserAbout> {
  logger = new Logger(UserAboutService.name);

  constructor(
    @InjectRepository(UserAbout)
    private readonly userAboutRepo: Repository<UserAbout>,
  ) {
    super(userAboutRepo);
  }

  async createUserAbout(userId: string) {
    await this.create({
      user: { id: userId },
    });
  }
}
