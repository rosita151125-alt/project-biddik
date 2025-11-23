import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginData.email,
      loginData.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerData: { 
    email: string; 
    password: string;
    name: string;
    role: UserRole;
    uptCode: string;
  }) {
    return this.authService.register(registerData);
  }
}
