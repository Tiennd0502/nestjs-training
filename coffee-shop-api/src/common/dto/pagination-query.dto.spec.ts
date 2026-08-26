import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../constants/pagination.constant';

describe('PaginationQueryDto', () => {
  it('defaults page and limit when both are omitted', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.limit).toBe(DEFAULT_LIMIT);
  });

  it('accepts and coerces explicit numeric-string page and limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '2', limit: '5' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('fails validation for a non-numeric page', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 'abc' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'page')).toBe(true);
  });

  it('fails validation for a non-numeric limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: 'abc' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('fails validation for a page below 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '0' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'page')).toBe(true);
  });

  it('fails validation for a limit below 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '0' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('fails validation for a limit above MAX_LIMIT', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      limit: String(MAX_LIMIT + 1),
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('leaves search undefined when omitted, with page/limit unaffected', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBeUndefined();
    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.limit).toBe(DEFAULT_LIMIT);
  });

  it('accepts a string search value', async () => {
    const dto = plainToInstance(PaginationQueryDto, { search: 'espresso' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('espresso');
  });

  it('fails validation for a non-string search', async () => {
    const dto = plainToInstance(PaginationQueryDto, { search: 123 });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'search')).toBe(true);
  });
});
