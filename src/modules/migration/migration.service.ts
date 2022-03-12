import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { IUser } from 'src/shared/interfaces/user.interface';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  generatePassword(len: number): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let retVal = '';
    for (var i = 0, n = charset.length; i < len; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
  async migrateUsers(): Promise<any> {
    // const url = 'https://afq-t32f44ncfa-ey.a.run.app/items/';
    const url = 'https://afq-t32f44ncfa-ey.a.run.app/';
    let users = (await axios.get(url + 'users')).data.data;
    if (users) {
      users = users.map((user) => ({
        username: user.last_name + '' + user.first_name,
        password: this.generatePassword(15),
        role: 'admin',
        oldId: user.id,
        email: user.email,
      }));
      for (let i = 0; i < users.length; i++) {
        await this.migrateUser(users[i]);
      }
    }
    return users.map((user) => ({
      username: user.username,
      password: user.password,
    }));
  }
  async migrateUser(toCreate: IUser): Promise<User> {
    const user = await this.userModel
      .findOne({ username: toCreate.username })
      .exec();
    if (user == null) {
      if (!toCreate || !toCreate.username || !toCreate.password) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not Complete',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      return new this.userModel({
        username: toCreate.username,
        password: toCreate.password,
        role: toCreate.role,
        oldId: toCreate.oldId,
        email: toCreate.email,
      }).save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'user already exists',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async migrateCategories(): Promise<any> {
    // const url = 'https://afq-t32f44ncfa-ey.a.run.app/items/';/items/category
    const url = 'https://afq-t32f44ncfa-ey.a.run.app/items/category';
    let categories = (await axios.get(url)).data.data;
    if (categories) {
      categories = categories.map((category) => {
        return {
        oldId: category.id,
        status: category.status,
        sort: category.sort,
        userCreated: category.user_created,
        dateCreated: category.date_created,
        userUpdated: category.user_updated,
        dateUpdated: category.date_updated,
        name: category.name,
        description: category.description,
      }});

      // TODO: Clear Collection

      for (let i = 0; i < categories.length; i++) {
        const userCreated = await this.userModel.findOne({ oldId: categories[i].userCreated }, ['_id']).exec();
        const userUpdated = await this.userModel.findOne({ oldId: categories[i].userUpdated }, ['_id']).exec();
        categories[i].userCreated = !!userCreated? userCreated._id: null;
        categories[i].userUpdated = !!userUpdated? userUpdated._id: null;
        new this.categoryModel(categories[i]).save();
      }
    }
    return categories;
  }
}
