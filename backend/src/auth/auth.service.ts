import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { createHash, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = this.comparePassword(pass, user.password_hash);
    if (!isMatch) return null;
    const { password_hash, ...result } = user;
    return result;
  }

  private comparePassword(input: string, storedHash: string) {
    if (!storedHash) return false;
    const derived = this.hashPassword(input);
    return timingSafeEqual(Buffer.from(storedHash), Buffer.from(derived));
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  async login(user: any) {
    const payload = { sub: user.user_id, email: user.email, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
