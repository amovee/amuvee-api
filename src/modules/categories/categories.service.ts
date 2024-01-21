import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { CategoryDTO, MinCategoryDTO } from 'src/shared/dtos/categories.dto';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';

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
      const category = categories[i];
      const admin = await this.userModel.findOne({ name: 'admin' }).exec();
      const c: any = {
        _id: new mongoose.Types.ObjectId(),
        id: await this.counter.setMaxSequenceValue('categories', +categories[i].id),
        icon: categories[i].icon,
        status: mappingStateType(categories[i].status),
        sort: categories[i].sort,
        roles: {
          author: undefined,
          reviewer: undefined,
        },
        history: [],
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
      if (category.user_created) {
        let userCreated = await this.userModel.findOne({ oldId: category.user_created }).exec();
        if (!userCreated) {
          userCreated = admin;
        }
        c.roles.author = userCreated._id;
        c.history.push({
          by: userCreated._id,
          date: category.date_created,
          eventType: HistoryEventType.created,
        });
      }
      if (category.user_updated) {
        const userUpdated = await this.userModel.findOne({ oldId: category.user_updated }).exec();
        if (userUpdated) {
          c.roles.author = userUpdated._id;
          c.history.push({
            by: userUpdated._id,
            date: category.date_updated,
            eventType: HistoryEventType.updated,
            value: 'Last update by Directus UI',
          });
        }
      }
      c.history.push({
        by: admin._id,
        date: new Date().toISOString(),
        eventType: HistoryEventType.migrated,
        value: 'Migrated from Directus',
      });
      new this.categoryModel(c).save();
    }
  }
}
