import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { Model } from 'mongoose';
import { User as IUser } from 'src/shared/interfaces/user.interface';

const publicUserFields = ['_id', 'role', 'username'];

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    userModel.count({}, function (err, count) {
      if(count == 0) {
        (new userModel({
          username: 'admin',
          password: 'test',
          role: 'admin'
        })).save();
        console.log('temp admin created');
      }
    });
  }

  async findOneByName(username: string): Promise<User> {    
    return this.userModel.findOne({ username }).exec();
  }
  async findOneById(id: string): Promise<User> {    
    return this.userModel.findOne({ _id: id }, publicUserFields).exec();
  }
  checkRole(role: string, newRole: string) {
    const roles = ['admin', 'reviewer', 'author', 'external', 'tester'];
    const rID: number = roles.findIndex((r: string) => r == role);
    const nID: number = roles.findIndex((r: string) => r == newRole);
    if(rID < 0 || nID < 0) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'unknown userrole',
      }, HttpStatus.FORBIDDEN);
    }
    if(nID >= rID) {
      return true;
    }
    return false;

  }
  async createUser(currentUser: IUser, toCreate: IUser): Promise<User> {
    if(this.checkRole(currentUser.role, toCreate.role)) {
      const user = await this.userModel.findOne({ username: toCreate.username }).exec();
      if(user == null) {
        if(!toCreate || !toCreate.username || !toCreate.password) {
          throw new HttpException({
            status: HttpStatus.FORBIDDEN,
            error: 'User not Complete',
          }, HttpStatus.FORBIDDEN);
        }
        return (new this.userModel({
          username: toCreate.username,
          password: toCreate.password,
          role: toCreate.role,
        })).save();
      } else {
        throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: 'user already exists',
        }, HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'net enought permission to create user',
      }, HttpStatus.FORBIDDEN);
    }
  }
  async createEmpty(name: string, password: string): Promise<User> {
    return (new this.userModel({
      name,
      password,
    })).save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, publicUserFields).exec();
  }

  async updateUserPassword(id: string, updatePasswordDTO: UpdatePasswordDTO): Promise<void> {
    const filter = { _id: id };
    const update = { password: updatePasswordDTO.newPassword };
    await this.userModel.findOneAndUpdate(filter, update);
  }
  async deleteOne (currentUser: IUser, id: string): Promise<void> {
    console.log(currentUser)
    if(currentUser.role != "admin")
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: 'No permission',
      }, HttpStatus.UNAUTHORIZED);

    await this.userModel.deleteOne({ _id: id }, publicUserFields).exec();
  }
}
