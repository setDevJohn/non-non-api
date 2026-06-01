import { applyDecorators } from '@nestjs/common';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const ApiResponse = <T>() => {
  return applyDecorators();
};
