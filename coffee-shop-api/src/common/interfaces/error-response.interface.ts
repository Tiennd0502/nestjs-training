export interface ErrorDetail {
  errCode: string;
  field: string;
  message: string;
  description: string;
}

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
}
