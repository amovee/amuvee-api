import {HttpException, Injectable, HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from 'src/shared/dtos/categories.dto';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { ResultsService } from 'src/modules/results/results.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    private readonly counter: CounterService,
    private readonly resultsService: ResultsService,
  ) {}

  async getCategories(language?: string): Promise<CategoryDTO[]> {
    const categories = <CategoryDTO[]>await this.categoryModel.find();
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
    await this.counter.deleteSequenzDocument('categories');
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
        id: await this.counter.setMaxSequenceValue(
          'categories',
          +categories[i].id,
        ),
        icon: categories[i].icon,
        status: mappingStateType(categories[i].status),
        sort: categories[i].sort,
        roles: {
          author: undefined,
          reviewer: undefined,
        },
        history: [],
        name: { de: categories[i].name},
        description: {de: categories[i].description},
        shortDescription: {de: categories[i].short_description},
      };
      if (categories[i].russian != null) {
        c.name['ru'] = categories[i].russian.name,
        c.description['ru'] = categories[i].russian.description,
        c.shortDescription['ru']  = categories[i].russian.short_description
      }
      if (categories[i].ukrainian != null) {
        c.name['uk'] = categories[i].ukrainian.name,
          c.description['uk'] = categories[i].ukrainian.description,
          c.shortDescription['uk']  = categories[i].ukrainian.short_description
      }
      if (category.user_created) {
        let userCreated = await this.userModel
          .findOne({ oldId: category.user_created })
          .exec();
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
        const userUpdated = await this.userModel
          .findOne({ oldId: category.user_updated })
          .exec();
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

  async countEvents(): Promise<{totalCount: number}> {
    return { totalCount: await this.categoryModel.countDocuments()};
  }
  async getListByLimitAndSkip(skip: number, limit: number) {
    return await this.categoryModel.find().skip(skip).limit(limit).exec();
  }

  async create(category: CreateCategoryDTO, userId: string): Promise<Category> {
    const id = await this.counter.getNextSequenceValue('events');
    const roles = { roles: { author: userId } };
    const history = {
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.created,
    };
    const newCategory = new this.categoryModel({
      _id: new mongoose.Types.ObjectId(),
      ...category,
      ...roles,
      id,
      history,
    }).save();
    return newCategory;
  }

  async getOneFromId(id: string): Promise<CategoryDTO | undefined> {
    if (isNaN(+id)) {
      return await this.categoryModel.findById(new mongoose.Types.ObjectId(id));
    }
    return await this.categoryModel.findOne({ id: +id });
  }

  async update(_id: string, changes: UpdateCategoryDTO, userId: string) {
    const category = await this.getOneFromId(_id);
    if (category) {
      category.history.push({
        by: userId,
        date: new Date().toISOString(),
        eventType: HistoryEventType.updated,
      });
      const updatedCategory =  await this.categoryModel.findByIdAndUpdate(
        { _id },
        { ...changes, history: [...category.history] },
        { new: true },
      );
      const resultsToUpdate = await this.resultModel.find(
        { "categories": updatedCategory._id });
      resultsToUpdate.map(async (r) => {
        await this.resultsService.updateMinResult(r._id);
      });
      return updatedCategory;
    }

    return null;
  }

  async delete(id: string): Promise<any> {
    let category;
    if (isNaN(+id)) {
      category = await this.categoryModel.findById(
        new mongoose.Types.ObjectId(id),
      );
    } else {
      category = await this.categoryModel.findOne({ id: +id });
    }
    if (!category) {
      throw new Error('Category not found');
    }
    /*
    const referenceCount = await this.resultModel.countDocuments({ categories: category._id });
    if (referenceCount > 0) {
      throw new Error('Cannot delete category because it is referenced in '+referenceCount+' results');
    }
    */
    try {
      await this.categoryModel.findByIdAndDelete(category._id);
      const resultsToUpdate = await this.resultModel.find({
        "categories": category._id
      });
      resultsToUpdate.map(async (r) => {
        r.categories = r.categories.filter((c) => c != category._id);
        await r.save();
      });
      resultsToUpdate.map(async (r) => {
        await this.resultsService.updateMinResult(r._id);
      });
      return `Category with id ${category.id} deleted`;
    } catch (error){
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
  }
}
