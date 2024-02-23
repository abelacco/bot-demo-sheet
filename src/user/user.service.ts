import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, FindUserDto, UpdateUserDto } from './dto';
import { Model, mongo } from 'mongoose';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { mongoExceptionHandler } from 'src/common/exceptions';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const createUser = await this._userModel.create(createUserDto);
      return createUser;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findOrCreateClient(createUserDto: CreateUserDto): Promise<User> {
    try {
      const findUser: User = await this._userModel
        .findOne({ phone: createUserDto.phone })
        .lean()
        .exec();
      if (findUser) {
        return findUser;
      }
      const createUser = await this.create(createUserDto);
      return createUser;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findAll(props?: FindUserDto): Promise<Array<User>> {
    try {
      const QUERY = {};
      if (props?.name) {
        QUERY['name'] = { $regex: props.name, $options: 'i' };
      }

      if (props?.phone) {
        QUERY['phone'] = props.phone;
      }
      const results = await this._userModel.find(QUERY);

      return results;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findByPhone(phone: string): Promise<User> {
    try {
      const findUser: User = await this._userModel.findOne({ phone });
      return findUser;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
