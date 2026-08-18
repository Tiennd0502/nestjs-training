import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  beforeEach(() => {
    authService = { register: jest.fn(), login: jest.fn() };
    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('register', () => {
    it('delegates to AuthService.register and returns its result', async () => {
      const dto = {
        email: 'jane@example.com',
        password: 'correct-horse-battery-staple',
      };
      authService.register.mockResolvedValue({ accessToken: 'token' });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'token' });
    });
  });

  describe('login', () => {
    it('delegates to AuthService.login and returns its result', async () => {
      const dto = {
        email: 'jane@example.com',
        password: 'correct-horse-battery-staple',
      };
      authService.login.mockResolvedValue({ accessToken: 'token' });

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'token' });
    });
  });
});
