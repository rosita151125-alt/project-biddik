import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // GET semua users
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // GET user by ID
  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // GET user by email
  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // CREATE user baru
  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  // UPDATE user
  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  // DELETE user
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
