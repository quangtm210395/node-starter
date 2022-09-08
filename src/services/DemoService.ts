import { Service } from 'typedi';

import { User } from '@Entities/User';

import { UserRepository } from '@Repositories/UserRepository';

@Service()
export class DemoService {
  constructor(
    private readonly userRepo: UserRepository,
  ){}

  async findByIds(ids: string[]) {
    return [{
      _id: '1',
      name: 'quang',
    }];
  }

  async createUser(name: string) {
    const user = new User();
    user.name = name;
    return this.userRepo.create(user);
  }
}
