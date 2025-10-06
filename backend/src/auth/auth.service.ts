import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('validateUser -> email:', email);
    const user = await this.usersService.findByEmail(email);
    console.log('validateUser -> user found:', !!user);
    if (!user) return null;
    
    const valid = await bcrypt.compare(password, user.password);
    console.log('validateUser -> password match:', valid);
    if (!valid) return null;
    
    delete (user as any).password;
    console.log('validateUser -> returning user:', user);
    return user;
  }

  async login(user: any) {
    console.log('login -> user received:', user);
    const payload = {
      sub: user._id?.toString() || user.id?.toString(),
      email: user.email,
      role: user.role
    };
    console.log('JWT payload ->', payload);
    const access_token = this.jwtService.sign(payload);
    console.log('JWT token created');
    return {
      access_token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(createUserDto: any) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }
}
