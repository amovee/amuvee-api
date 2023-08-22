import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { CategoryDTO, MinCategoryDTO } from 'src/shared/dtos/categories.dto';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { migrateRoles } from 'src/shared/dtos/roles.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly counter: CounterService,
  ) {}

  async getCategoriesMin(language?: string): Promise<MinCategoryDTO[]> {
    const categories = <MinCategoryDTO[]>(
      await this.categoryModel.find().select('_id icon content')
    );
    if (language) {
      for (let i = 0; i < categories.length; i++) {
        const c = <MinCategoryDTO>new this.categoryModel(categories[i]).toJSON();
        if (c.content.hasOwnProperty(language))
          c.content = { [language]: c.content[language] };
        else if (c.content.hasOwnProperty('de'))
          c.content = { de: c.content.de };
        else c.content = {};
        categories[i] = c;
      }
    }
    return categories;
  }

  async getCategories(language?: string): Promise<CategoryDTO[]> {
    const categories = <CategoryDTO[]>(
      await this.categoryModel.find()
    );
    if (language) {
      for (let i = 0; i < categories.length; i++) {
        const c = <CategoryDTO>new this.categoryModel(categories[i]).toJSON();
        if (c.content.hasOwnProperty(language))
          c.content = { [language]: c.content[language] };
        else if (c.content.hasOwnProperty('de'))
          c.content = { de: c.content.de };
        else c.content = {};
        categories[i] = c;
      }
    }
    return categories;
  }

  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('categories')
    await this.categoryModel.deleteMany().exec();
    const users: User[] = await this.userModel.find().exec();
    const categories = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/category?fields=*,russian.*,ukrainian.*',
      )
    ).data.data;
    if (!categories) return;
    for (let i = 0; i < categories.length; i++) {
      const c: any = {
        _id: new mongoose.Types.ObjectId(),
        id: await this.counter.setMaxSequenceValue('categories', +categories[i].id),
        icon: categories[i].icon,
        status: mappingStateType(categories[i].status),
        sort: categories[i].sort,
        roles: migrateRoles(categories[i], users),
        content: {
          de: {
            description: categories[i].description,
            shortDescription: categories[i].short_description,
            name: categories[i].name,
          },
        },
      };
      if (categories[i].russian != null) {
        c.content['ru'] = {
          name: categories[i].russian.name,
          description: categories[i].russian.description,
          shortDescription: categories[i].russian.short_description,
        };
      }
      if (categories[i].ukrainian != null) {
        c.content['uk'] = {
          name: categories[i].ukrainian.name,
          description: categories[i].ukrainian.description,
          shortDescription: categories[i].ukrainian.short_description,
        };
      }
      new this.categoryModel(c).save();
    }
  }
}
