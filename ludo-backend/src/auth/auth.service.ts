import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
    //TODO: Encrypt passwords
    constructor(private usersService: UsersService, private jwtService: JwtService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        console.log("Checking user " + username)
        const user = await this.usersService.findOne(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            return { userId: user._id, username: user.username };
        }
        return null;
    }
    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            accessToken: this.jwtService.sign(payload),
            username: user.username
        };
    }

    async verify(token: string) {

        try {
            this.jwtService.verify(token)
        }
        catch {
            console.log("Invalid token")
            return Error
        }
        return this.jwtService.decode(token)
    }
}
