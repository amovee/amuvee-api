import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import { Model } from 'mongoose';

import axios from 'axios';


@Injectable()
export class CategoriesService {

  public categories: any;
    
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {
    this.migrateData();
  }
  
  async migrateData() {
    if(!this.categories) {
      const url = 'https://afq-t32f44ncfa-ey.a.run.app/items/';
      // this.categories = (await axios.get(url + 'category')).data.data;
      // console.log(this.categories);
      
      
      
    }
  }

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