import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';

@ApiTags('Auth')
@Public()
@Controller('/auth')
export class AuthController {
  private readonly redirectMainUrl: string;

  constructor(private readonly authService: AuthService) {
    if (process.env.NODE_ENV === 'production') {
      this.redirectMainUrl = 'https://asklia.io';
    } else {
      this.redirectMainUrl = 'http://localhost:4500';
    }
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  public async googleAuth() {
    // Redirect to the Google authentication page
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  public async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    await this.setTokenCookie(req, res);
  }

  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  public async kakaoAuth() {
    // Redirect to the Kakao authentication page
  }

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  public async kakaoAuthRedirect(@Req() req: Request, @Res() res: Response) {
    await this.setTokenCookie(req, res);
  }

  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  public async naverAuth() {
    // Redirect to the Naver authentication page
  }

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  public async naverAuthRedirect(@Req() req: Request, @Res() res: Response) {
    await this.setTokenCookie(req, res);
  }

  private async setTokenCookie(req: Request, res: Response) {
    const user = req.user;
    const accessToken = await this.authService.loginUser(user);

    res.cookie('authorization', accessToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.redirect(this.redirectMainUrl);
  }
}
