import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔐 Login attempt for:', email);
    
    const user = await this.usersRepository.findOne({ where: { email } });
    console.log('📋 User found:', user ? `${user.name} (${user.role})` : 'NOT FOUND');
    
    if (user) {
      console.log('🔑 Stored password hash:', user.password);
      console.log('🔑 Input password:', password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('✅ Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    
    console.log('❌ Login failed for:', email);
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      uptCode: user.uptCode 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        uptCode: user.uptCode
      }
    };
  }

  async register(userData: { 
    email: string; 
    password: string;
    name: string;
    role: UserRole;
    uptCode: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    
    const { password, ...result } = user;
    return result;
  }
}
