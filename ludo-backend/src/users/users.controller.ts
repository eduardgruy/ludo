import { Controller, Get, Request, Post, UseGuards, Res, Body, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/jwt-auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Public()
    @Post('/register')
    async addUser(@Res() res, @Body() createUserDTO: CreateUserDTO) {
        console.log(createUserDTO)
        const user = await this.userService.create(createUserDTO);
        const { password, ...result } = user
        return res.status(HttpStatus.OK).json({
            message: 'User has been created successfully',
            username: result.username,
        });
    }

}
