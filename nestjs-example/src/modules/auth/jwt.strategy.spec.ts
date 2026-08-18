import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('returns the userId and email from a valid payload', () => {
    const configService = {
      get: () => 'test-secret',
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(configService);

    const result = strategy.validate({ sub: 1, email: 'jane@example.com' });

    expect(result).toEqual({ userId: 1, email: 'jane@example.com' });
  });
});
