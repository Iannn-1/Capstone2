import { Request, Response, NextFunction } from 'express'
import { apiKeyMiddleware } from './apiKeyMiddleware'

/**
 * Unit tests for apiKeyMiddleware (Requirement 6.2).
 */

const VALID_KEY = 'test-secret-key'

function makeReq(apiKeyHeader?: string): Partial<Request> {
  return {
    headers: apiKeyHeader !== undefined ? { 'x-api-key': apiKeyHeader } : {},
  }
}

function makeRes(): { status: jest.Mock; json: jest.Mock } {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res) // enable chaining: res.status(401).json(...)
  return res
}

describe('apiKeyMiddleware', () => {
  const originalEnv = process.env.API_KEY

  beforeEach(() => {
    process.env.API_KEY = VALID_KEY
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.API_KEY
    } else {
      process.env.API_KEY = originalEnv
    }
  })

  it('calls next() when the correct API key is provided', () => {
    const req = makeReq(VALID_KEY)
    const res = makeRes()
    const next = jest.fn() as NextFunction

    apiKeyMiddleware(req as Request, res as unknown as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('returns 401 when the X-API-Key header is missing', () => {
    const req = makeReq() // no header
    const res = makeRes()
    const next = jest.fn() as NextFunction

    apiKeyMiddleware(req as Request, res as unknown as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' })
  })

  it('returns 401 when the X-API-Key header is wrong', () => {
    const req = makeReq('wrong-key')
    const res = makeRes()
    const next = jest.fn() as NextFunction

    apiKeyMiddleware(req as Request, res as unknown as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' })
  })

  it('returns 401 when the X-API-Key header is an empty string', () => {
    const req = makeReq('')
    const res = makeRes()
    const next = jest.fn() as NextFunction

    apiKeyMiddleware(req as Request, res as unknown as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' })
  })

  it('does not include the API key value in the error response body', () => {
    const req = makeReq('leaked-key')
    const res = makeRes()
    const next = jest.fn() as NextFunction

    apiKeyMiddleware(req as Request, res as unknown as Response, next)

    const body = res.json.mock.calls[0][0]
    expect(JSON.stringify(body)).not.toContain(VALID_KEY)
    expect(JSON.stringify(body)).not.toContain('leaked-key')
  })
})
