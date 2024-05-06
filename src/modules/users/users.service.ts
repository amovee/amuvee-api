import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { right } from 'src/shared/dtos/rights';
import {
  UpdatePasswordDTO,
  createUserDTO,
  updateUserDTO,
} from 'src/shared/dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.userModel.countDocuments().then((count) => {
      if (!count) this.initAdmin();
    });
  }
  async initAdmin() {
    const encriptedKey = await bcrypt.hash(process.env.DEFAULT_PASS, 10);
    this.createUser({
      name: 'admin',
      password: encriptedKey,
      email: 'admin@admin.de',
      rights: [],
      isAdmin: true,
    } as createUserDTO).catch((err) => {
      console.log('user already exists');
    });
  }
  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }
  async updateOne(_id: string, changes: updateUserDTO) {
    await this.userModel.findByIdAndUpdate({ _id: _id }, changes);
  }
  async updateToken(_id: ObjectId, token: string) {
    await this.userModel.findByIdAndUpdate({ _id: _id }, { token: token });
  }
  async checkUserHasRight(right: right, _id: string): Promise<boolean> {
    const user = await this.userModel.findById(_id).exec()
    return user.isAdmin || user.rights.includes(right);
  }
  async createUser(user: createUserDTO): Promise<string> {
    const existingUser = await this.userModel
      .findOne({ email: user.email })
      .exec();
    if (existingUser !== null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'user already exists',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const newPassword = this.generatePassword(20);
    const encriptedKey = await bcrypt.hash(newPassword, 10);
    await new this.userModel({
      name: user.name,
      rights: user.rights,
      email: user.email,
      password: user.password ? user.password : encriptedKey,
      isAdmin: user.isAdmin,
    }).save();
    return newPassword;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }
  async findOne(id: string | number): Promise<User[]> {
    const idMatch = isNaN(+id)
      ? { _id: new mongoose.Types.ObjectId(id) }
      : { id: +id };
    return this.userModel.find(idMatch).select('-password').exec();
  }
  async updateUserPassword(
    updatePasswordDTO: UpdatePasswordDTO,
    email: string,
  ): Promise<boolean> {
    const filter = { email: email };
    const update = { password: updatePasswordDTO };
    return true;
    // await this.userModel.findOneAndUpdate(filter, update);
  }
  async regeneratePassword(id: string): Promise<string> {
    const user: User = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'user does not exist!',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const newPassword = this.generatePassword(20);
    const encriptedKey = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(
      { _id: id },
      { password: encriptedKey },
    );
    return newPassword;
  }
  async deleteOne(email, id: string): Promise<void> {
    const user = await this.findOneByEmail(email);
    if (user._id.toString() == id)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'You can not delete yourselve!',
        },
        HttpStatus.FORBIDDEN,
      );
    await this.userModel.deleteOne({ _id: id }).exec();
  }
  async migrate(): Promise<void> {
    await this.userModel.deleteMany().exec();
    await this.initAdmin();
    const users = (
      await axios.get(
        process.env.DIRECTUS_URL + 'users?fields=id,first_name,email,status',
      )
    ).data.data;
    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const encriptedKey = await bcrypt.hash(process.env.DEFAULT_PASS, 10);
        new this.userModel(<createUserDTO>{
          oldId: user.id,
          name: user.first_name + (user.last_name ? user.last_name : ''),
          password: encriptedKey,
          email: user.email,
          rights: [],
          isAdmin: false,
        }).save();
      }
    }
  }
  generatePassword(len: number): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let retVal = '';
    for (let i = 0, n = charset.length; i < len; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
}
