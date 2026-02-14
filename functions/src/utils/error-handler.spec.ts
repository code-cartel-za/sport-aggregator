import { handleError, ValidationError, ExternalApiError, AppError } from './error-handler';
import { Response } from 'express';

function createMockResponse(): { res: Response; statusCode: number; body: Record<string, unknown> } {
  const mock = { statusCode: 0, body: {} as Record<string, unknown> };
  const json = jest.fn((body: Record<string, unknown>) => { mock.body = body; });
  const status = jest.fn((code: number) => { mock.statusCode = code; return { json }; });
  const res = { status, json } as unknown as Response;
  return { res, ...mock };
}

describe('handleError', () => {
  it('should send 400 for ValidationError', () => {
    const { res } = createMockResponse();
    handleError(new ValidationError('Bad input'), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should send 502 for ExternalApiError', () => {
    const { res } = createMockResponse();
    handleError(new ExternalApiError('API down'), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('should send 500 for AppError', () => {
    const { res } = createMockResponse();
    handleError(new AppError('Internal', 500, 'INTERNAL_ERROR'), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should send 500 for unknown error', () => {
    const { res } = createMockResponse();
    handleError('some string error', res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should include correct error code in response', () => {
    const { res } = createMockResponse();
    const json = jest.fn();
    (res.status as jest.Mock).mockReturnValue({ json });
    handleError(new ValidationError('Bad'), res);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
  });

  it('should include timestamp in response', () => {
    const { res } = createMockResponse();
    const json = jest.fn();
    (res.status as jest.Mock).mockReturnValue({ json });
    handleError(new ValidationError('Bad'), res);
    const call = json.mock.calls[0][0] as Record<string, unknown>;
    expect(call['timestamp']).toBeDefined();
    expect(typeof call['timestamp']).toBe('string');
  });
});
