import { ApiProperty } from '@nestjs/swagger';
import { ErrorDetail } from '../interfaces/error-response.interface.js';

export class ErrorDetailDto implements ErrorDetail {
  @ApiProperty()
  errCode!: string;

  @ApiProperty()
  field!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  description!: string;
}
