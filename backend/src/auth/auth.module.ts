import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';

// ✅ CONFIG STATIC SEDERHANA
const jwtConfig = {
  secret: 'your-super-secret-key-2024', // Ganti dengan secret yang kuat
  signOptions: {expiresIn: 86400 },
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register(jwtConfig), // ✅ PAKAI REGISTER STATIC
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
