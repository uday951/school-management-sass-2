import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
      userAgent,
      ipAddress,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          tenantId: user.tenantId,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies['refreshToken'] || req.body.refreshToken;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
      token,
      userAgent,
      ipAddress,
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      statusCode: 200,
      message: 'Tokens rotated successfully',
      data: { 
        accessToken,
        refreshToken: newRefreshToken
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies['refreshToken'] || req.body.refreshToken;
    await authService.logout(token);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    res.json({
      statusCode: 200,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    statusCode: 200,
    message: 'User profile retrieved',
    data: req.user,
  });
});

export default router;
