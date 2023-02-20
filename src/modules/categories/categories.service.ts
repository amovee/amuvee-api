import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './category.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getCategories(language?: string): Promise<Category[]> {
    const categories = <Category[]>(
      await this.categoryModel.find().select('-updated -created -oldId -status')
    );
    if (language) {
      for (let i = 0; i < categories.length; i++) {
        const c = <Category>new this.categoryModel(categories[i]).toJSON();
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
        oldId: +categories[i].id,
        icon: categories[i].icon,
        status: categories[i].status,
        sort: categories[i].sort,
        content: {
          de: {
            description: categories[i].description,
            shortDescription: categories[i].short_description,
            name: categories[i].name,
          },
        },
      };
      const userUpdated: User = users.find((user) => {
        return user.oldId == categories[i].user_updated;
      });
      if (userUpdated) {
        c.updated = {
          by: userUpdated._id,
          date: categories[i].date_updated,
        };
      }
      const userCreated: User = users.find((user) => {
        return user.oldId == categories[i].user_created;
      });
      if (userCreated) {
        c.created = {
          by: userCreated._id,
          date: categories[i].date_created,
        };
      }
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
