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
}
