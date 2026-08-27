import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseBody } from '../interfaces/error-response.interface';
import { ErrorDetailDto } from './error-detail.dto';

export class ErrorResponseDto implements ErrorResponseBody {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: () => ErrorDetailDto, isArray: true })
  errors!: ErrorDetailDto[];
}
