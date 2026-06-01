import { Controller, Post, Body, Get, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      return this.authService.register(registerDto);
    } catch (error) {
      console.error('Error registering user:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      return this.authService.login(loginDto);
    } catch (error) {
      console.error('Error logging in:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@Request() req: any) {
    try {
      return this.authService.getUserById(req.user.id);
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new InternalServerErrorException('Failed to fetch user info');
    }
  }
}
