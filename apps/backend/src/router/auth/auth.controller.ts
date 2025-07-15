import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';
import { AuthClientCallbackDto } from '@lia/api/auth/callback.dto';
import { SsoUser } from './auth.type';

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

  @Get('/github')
  @UseGuards(AuthGuard('github'))
  public async githubAuth() {
    // Redirect to the GitHub authentication page
  }

  @Get('/github/callback')
  @UseGuards(AuthGuard('github'))
  public async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    await this.setTokenCookie(req, res);
  }

  @Delete('/logout')
  public async logout(@Req() req: Request, @Res() res: Response) {
    const session = req.session;
    session.destroy((err) => {
      if (err) {
        console.error('[logout] session destroy error', err);
      }
    });
    res.redirect(`${this.redirectMainUrl}/login`);
  }

  @Post('/callback')
  public async callback(@Body() body: AuthClientCallbackDto, @Req() req: Request, @Res() res: Response) {
    const session = req.session;

    if (session.user) {
      res.json({ statusCode: HttpStatus.OK });
      return;
    }

    const user = await this.authService.validateToken(body.token);
    session.user = user;
    session.save(() => {
      res.json({ statusCode: HttpStatus.CREATED });
    });
  }

  private async setTokenCookie(req: Request, res: Response) {
    const user = req.user as SsoUser;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const accessToken = await this.authService.loginUser(user);
    res.redirect(`${this.redirectMainUrl}/login/callback?token=${accessToken}`);
  }
}
