import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

function createMockHost(): { host: ReturnType<typeof Object.create>; response: { status: jest.Mock; json: jest.Mock; statusCode: number; body: Record<string, unknown> } } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status, json, statusCode: 0, body: {} };

  json.mockImplementation((body: Record<string, unknown>) => {
    response.body = body;
  });
  status.mockImplementation((code: number) => {
    response.statusCode = code;
    return { json };
  });

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
    }),
  };
  return { host: host as never, response };
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  it('should handle HttpException with custom error body', () => {
    const { host, response } = createMockHost();
    const exception = new HttpException(
      { success: false, error: { code: 'CUSTOM_ERROR', message: 'Custom message' } },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, host);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'CUSTOM_ERROR', message: 'Custom message' },
    });
  });

  it('should handle HttpException with message array (validation errors)', () => {
    const { host, response } = createMockHost();
    const exception = new BadRequestException({ message: ['field1 is required', 'field2 must be a number'] });
    filter.catch(exception, host);
    expect(response.status).toHaveBeenCalledWith(400);
    const body = response.body as { error: { message: string; code: string } };
    expect(body.error.message).toContain('field1 is required');
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle unknown errors as 500', () => {
    const { host, response } = createMockHost();
    filter.catch(new Error('Something broke'), host);
    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.body as { error: { code: string } };
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});
