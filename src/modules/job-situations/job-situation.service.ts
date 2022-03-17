import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import axios from 'axios';
import { Meta, MetaDocument } from 'src/shared/schemas/meta.schema';


@Injectable()
export class JobSituationsService {

  public jobSituations: any;
    
  constructor(
    @InjectModel('JobRelatedSituation')
    private jobRelatedSituationModel: Model<MetaDocument>,
  ) {}
  

  async findAll(): Promise<Meta[]> {
    return  (await this.jobRelatedSituationModel.find().exec())
  }
}