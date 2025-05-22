import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { AuthClientCallbackDto } from '@lia/api/auth/callback.dto';

@ApiTags('Auth')
@Public()
@Controller('/auth')
export class AuthController {
  private readonly redirectMainUrl: string;
  private readonly isProd: boolean;

  constructor(private readonly authService: AuthService) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.redirectMainUrl = this.isProd ? 'https://asklia.io' : 'http://localhost:4500';
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

  @Post('/callback')
  public async callback(@Body() body: AuthClientCallbackDto, @Res() res: Response) {
    await this.authService.validateToken(body.token);

    res.cookie('authorization', body.token, {
      httpOnly: this.isProd,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: '/',
      domain: this.isProd ? '.asklia.io' : undefined,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ statusCode: HttpStatus.CREATED });
  }

  private async setTokenCookie(req: Request, res: Response) {
    const user = req.user;
    const accessToken = await this.authService.loginUser(user);
    res.redirect(`${this.redirectMainUrl}/login/callback?token=${accessToken}`);
  }
}
