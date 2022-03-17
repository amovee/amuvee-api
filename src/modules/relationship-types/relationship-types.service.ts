import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from 'src/shared/schemas/meta.schema';


@Injectable()
export class RelationshipTypesService {
    
  constructor(
    @InjectModel('RelationshipType')
    private relationshipTypesModel: Model<MetaDocument>,
  ) {}
  

  async findAll(): Promise<Meta[]> {
    return  (await this.relationshipTypesModel.find().exec())
  }
}