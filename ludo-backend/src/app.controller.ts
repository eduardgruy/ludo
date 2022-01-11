import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Public } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {

    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return JSON.stringify(req.user);
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
