import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'



@Injectable()
export class UsersService {

    constructor(
        @Inject('USER_MODEL')
        private userModel: Model<User>,
    ) { }


    async findOne(username: string): Promise<User> {
        return this.userModel.findOne({ username: username.toLowerCase() });
    }
    async create(user: CreateUserDTO): Promise<User> {

        const newUser = new this.userModel({ username: user.username.toLowerCase(), password: await bcrypt.hash(user.password, 10) });
        return newUser.save();

    }
}
