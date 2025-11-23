import { Taruna } from './taruna/taruna.entity';
import { Dosen } from './dosen/dosen.entity';
import { DosenModule } from './dosen/dosen.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TarunaModule } from './taruna/taruna.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Dosen, Taruna],
        synchronize: false,  
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DosenModule,
    TarunaModule,
  ],
})
export class AppModule {}
