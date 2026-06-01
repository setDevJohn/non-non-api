import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, height, weight, birthDate, hydrationOption } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Calculate hydration goal based on weight and hydration option
    const hydrationMultiplier = hydrationOption === '35ml/kg' ? 35 : 28;
    const hydrationGoalMl = weight ? Math.round(weight * hydrationMultiplier) : 2000;

    // Parse birth date if provided (handle DD-MM-YYYY format)
    let parsedBirthDate = null;
    if (birthDate) {
      try {
        // Try to parse DD-MM-YYYY format
        if (birthDate.includes('-')) {
          const parts = birthDate.split('-');
          if (parts.length === 3) {
            // Check if it's DD-MM-YYYY
            if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
              const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              // Validate the date is real
              if (!isNaN(date.getTime())) {
                parsedBirthDate = date;
              }
            } else {
              // Try to parse as-is
              const date = new Date(birthDate);
              if (!isNaN(date.getTime())) {
                parsedBirthDate = date;
              }
            }
          }
        } else {
          const date = new Date(birthDate);
          if (!isNaN(date.getTime())) {
            parsedBirthDate = date;
          }
        }
      } catch (error) {
        console.error('Error parsing birth date:', error);
        parsedBirthDate = null;
      }
    }

    // Create user
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          heightCm: height,
          weightKg: weight,
          hydrationGoalMl,
          birthDate: parsedBirthDate,
        },
        select: {
          id: true,
          email: true,
          name: true,
          photoUrl: true,
          heightCm: true,
          weightKg: true,
          hydrationGoalMl: true,
          birthDate: true,
        },
      });

      // Generate JWT token
      const accessToken = this.generateToken(user.id, user.email);

      return {
        accessToken,
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user.id, user.email);

    return {
      accessToken,
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        heightCm: true,
        weightKg: true,
        hydrationGoalMl: true,
        birthDate: true,
        createdAt: true,
      },
    });
  }
}
