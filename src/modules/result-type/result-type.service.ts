import { Injectable } from '@nestjs/common';

@Injectable()
export class ResultTypeService {

  async getAll() {
    return 'getAll';
  }

}
