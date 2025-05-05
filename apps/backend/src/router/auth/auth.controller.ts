import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCallbackResponse } from '@lia/api/auth/callback.dto';
import type { Request } from 'express';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  public async googleAuth() {
    // Redirect to the Google authentication page
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  public async googleAuthRedirect(@Req() req: Request): Promise<AuthCallbackResponse> {
    const user = req.user;
    const data = await this.authService.loginUser(user);

    /**
     * Todo: FE Redirect 및 토큰 저장
     */

    return { statusCode: HttpStatus.OK, data };
  }

  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  public async kakaoAuth() {
    // Redirect to the Kakao authentication page
  }

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  public async kakaoAuthRedirect(@Req() req: Request): Promise<AuthCallbackResponse> {
    const user = req.user;
    const data = await this.authService.loginUser(user);

    /**
     * Todo: FE Redirect 및 토큰 저장
     */

    return { statusCode: HttpStatus.OK, data };
  }

  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  public async naverAuth() {
    // Redirect to the Naver authentication page
  }

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  public async naverAuthRedirect(@Req() req: Request): Promise<AuthCallbackResponse> {
    const user = req.user;
    const data = await this.authService.loginUser(user);

    /**
     * Todo: FE Redirect 및 토큰 저장
     */

    return { statusCode: HttpStatus.OK, data };
  }
}
