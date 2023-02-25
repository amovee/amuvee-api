import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createUserDTO, UserDTO } from 'src/types/types.dto';
import axios from 'axios';
import { right } from 'src/types/rights';
import { UpdatePasswordDTO } from './update-password.dt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    userModel.count().then((count) => {
      if (!count) {
        
        bcrypt.hash(process.env.DEFAULT_PASS, 10).then((encriptedKey: string)=>{
          this.createUser({
            name: 'admin',
            password: encriptedKey,
            email: 'admin',
            rights: [],
            isAdmin: true
          } as createUserDTO).catch((err) => {
            console.log('admin exists');
          });
        });
      }
    });
  }
  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }
  async updateToken(_id: ObjectId, token: string) {
    await this.userModel.findByIdAndUpdate({_id: _id}, {token: token});
  }
  // async findOneById(id: string): Promise<User> {
  //   return this.userModel.findOne({ _id: id }, publicUserFields).exec();
  // }
  async checkUserHasRight(right: right, email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email)
    return user.isAdmin || user.rights.includes(right);
  }
  async createUser(user: createUserDTO): Promise<UserDTO> {
    const existingUser = await this.userModel
      .findOne({ name: user.name })
      .exec();
    if (existingUser !== null) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'user already exists',
        },
        HttpStatus.FORBIDDEN
      );
    }
    const encriptedKey = await bcrypt.hash(process.env.SECRET, 10);
    new this.userModel({
      name: user.name,
      rights: user.rights,
      email: user.email,
      password: encriptedKey,
      isAdmin: user.isAdmin,
    }).save();
    return {
      name: user.name,
      email: user.email,
      rights: user.rights,
      isAdmin: user.isAdmin,
    } as UserDTO;
  }
  // async createUser(currentUser: User, toCreate: User): Promise<User> {
  //   if(this.checkRole(currentUser.role, toCreate.role)) {
  //     const user = await this.userModel.findOne({ username: toCreate.username }).exec();
  //     if(user == null) {
  //       if(!toCreate || !toCreate.username || !toCreate.password) {
  //         throw new HttpException({
  //           status: HttpStatus.FORBIDDEN,
  //           error: 'User not Complete',
  //         }, HttpStatus.FORBIDDEN);
  //       }
  //       return (new this.userModel(
  //         {
  //         username: toCreate.username,
  //         password: toCreate.password,
  //         role: toCreate.role,
  //         email: toCreate.email
  //       } as User)).save();
  //     } else {
  //       throw new HttpException({
  //         status: HttpStatus.FORBIDDEN,
  //         error: 'user already exists',
  //       }, HttpStatus.FORBIDDEN);
  //     }
  //   } else {
  //     throw new HttpException({
  //       status: HttpStatus.FORBIDDEN,
  //       error: 'net enought permission to create user',
  //     }, HttpStatus.FORBIDDEN);
  //   }
  // }
  // async createEmpty(name: string, password: string): Promise<User> {
  //   return (new this.userModel({
  //     name,
  //     password,
  //   })).save();
  // }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }
  async updateUserPassword(updatePasswordDTO: UpdatePasswordDTO, email: string): Promise<boolean> {
    const filter = { email: email };
    const update = { password: updatePasswordDTO };
    return true;
    // await this.userModel.findOneAndUpdate(filter, update);
  }
  // async deleteOne (currentUser: IUser, id: string): Promise<void> {
  //   if(currentUser.role != "admin")
  //     throw new HttpException({
  //       status: HttpStatus.UNAUTHORIZED,
  //       error: 'No permission',
  //     }, HttpStatus.UNAUTHORIZED);

  //   await this.userModel.deleteOne({ _id: id }, publicUserFields).exec();
  // }
  async migrate(): Promise<void> {
    await this.userModel.deleteMany().exec();
    const users = (
      await axios.get(
        process.env.DIRECTUS_URL + 'users?fields=id,first_name,email,status'
      )
    ).data.data;
    if(users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];        
        const encriptedKey = await bcrypt.hash(process.env.DEFAULT_PASS, 10);
        new this.userModel(<createUserDTO>{
          oldId: user.id,
          name: user.first_name + (user.last_name?user.last_name:''),
          password: encriptedKey,
          email: user.email,
          rights: [],
          isAdmin: false
        }).save();
      }
    }
  }
}
