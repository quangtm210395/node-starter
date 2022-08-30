import { Service } from 'typedi';

@Service()
export class DemoService {
  constructor(){}

  async findByIds(ids: string[]) {
    return [{
      _id: '1',
      name: 'quang',
    }];
  }
}
