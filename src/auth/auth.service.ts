import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        throw new UnauthorizedException('User not found '+email+' '+pass+' '+user);
        // if (!user) {
        //     throw new UnauthorizedException('User not found');
        // }
        // if (user && (await bcrypt.compare(pass, user.password))) {
        //     const { password, ...result } = user;
        //     return result;
        // }
        // return null;
    }

    async login(user: any) {
        console.log('user', user);
        const payload = { email: user.email, sub: user.user_id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
