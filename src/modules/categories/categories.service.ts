import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import { Model } from 'mongoose';


@Injectable()
export class CategoriesService {
    
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async createEmpty(name: string): Promise<Category> {
    const createdCategory = new this.categoryModel({
      name,
      results: []
    });
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }
}