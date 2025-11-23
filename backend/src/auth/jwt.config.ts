import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-key-2024',
  signOptions: { expiresIn: '24h' },
});
