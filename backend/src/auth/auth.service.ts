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
    
    // Check if user is active (not blocked)
    if (user.isActive === false) {
      console.log('validateUser -> user is blocked');
      throw new UnauthorizedException('Account has been blocked. Please contact support.');
    }
    
    const valid = await bcrypt.compare(password, user.password);
    console.log('validateUser -> password match:', valid);
    if (!valid) return null;
    
    delete (user as any).password;
    console.log('validateUser -> returning user:', user);
    return user;
  }

  async login(user: any) {
    console.log('login -> user received:', user);
    const userId = (user as any)._id?.toString() || (user as any).id?.toString();
    const payload = {
      sub: userId,
      email: user.email,
      role: user.role
    };
    console.log('JWT payload ->', payload);
    const access_token = this.jwtService.sign(payload);
    console.log('JWT token created');
    return {
      access_token,
      user: {
        id: (user as any)._id || (user as any).id,
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
    const { password, ...userWithoutPassword } = user;
    
    // Generate JWT token for the new user
    const userId = (user as any)._id?.toString() || (user as any).id?.toString();
    const payload = {
      sub: userId,
      email: user.email,
      role: user.role
    };
    const access_token = this.jwtService.sign(payload);
    
    return {
      access_token,
      user: userWithoutPassword,
    };
  }
}
