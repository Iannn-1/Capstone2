import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authMiddleware } from './authMiddleware'

const TEST_SECRET = 'test-secret'

/** Build a minimal mock Express Request */
function makeReq(authorization?: string): Partial<Request> {
  return {
    headers: authorization ? { authorization } : {},
  }
}

/** Build a spy-based mock Express Response */
function makeRes(): { res: Partial<Response>; statusCode: number | undefined; body: unknown } {
  const ctx: { statusCode: number | undefined; body: unknown } = {
    statusCode: undefined,
    body: undefined,
  }
  const json = jest.fn((data: unknown) => {
    ctx.body = data
    return res
  })
  const status = jest.fn((code: number) => {
    ctx.statusCode = code
    return { json }
  })
  const res = { status } as unknown as Partial<Response>
  return { res, ...ctx }
}

function makeNext(): NextFunction {
  return jest.fn()
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('authMiddleware – valid token', () => {
  const originalEnv = process.env.JWT_SECRET

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET
  })

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv
  })

  it('calls next() and attaches user to req when token is valid', () => {
    const payload = { id: 1, email: 'admin@school.edu', role: 'admin' }
    const token = jwt.sign(payload, TEST_SECRET)

    const req = makeReq(`Bearer ${token}`) as Request
    const { res } = makeRes()
    const next = makeNext()

    authMiddleware(req, res as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toEqual(expect.objectContaining(payload))
  })

  it('attaches id, email and role from the token payload', () => {
    const payload = { id: 42, email: 'staff@school.edu', role: 'staff' }
    const token = jwt.sign(payload, TEST_SECRET)

    const req = makeReq(`Bearer ${token}`) as Request
    const { res } = makeRes()
    const next = makeNext()

    authMiddleware(req, res as Response, next)

    expect(req.user).toEqual({ id: 42, email: 'staff@school.edu', role: 'staff' })
  })
})

// ---------------------------------------------------------------------------
// Unauthorized cases
// ---------------------------------------------------------------------------

describe('authMiddleware – missing or invalid token', () => {
  const originalEnv = process.env.JWT_SECRET

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET
  })

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv
  })

  function expectUnauthorized(
    req: Partial<Request>,
    done?: jest.DoneCallback
  ) {
    const ctx = makeRes()
    const next = makeNext()

    authMiddleware(req as Request, ctx.res as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(ctx.res.status).toHaveBeenCalledWith(401)
    // Access body from the json mock
    const jsonMock = (ctx.res.status as jest.Mock).mock.results[0].value.json as jest.Mock
    expect(jsonMock).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' })
  }

  it('returns 401 when Authorization header is missing', () => {
    expectUnauthorized(makeReq())
  })

  it('returns 401 when Authorization header has no Bearer prefix', () => {
    expectUnauthorized(makeReq('Token sometoken'))
  })

  it('returns 401 when token is malformed', () => {
    expectUnauthorized(makeReq('Bearer not.a.real.token'))
  })

  it('returns 401 when token is signed with a different secret', () => {
    const token = jwt.sign({ id: 1, email: 'x@x.com', role: 'admin' }, 'wrong-secret')
    expectUnauthorized(makeReq(`Bearer ${token}`))
  })

  it('returns 401 when token is expired', () => {
    const token = jwt.sign(
      { id: 1, email: 'x@x.com', role: 'admin' },
      TEST_SECRET,
      { expiresIn: -1 } // already expired
    )
    expectUnauthorized(makeReq(`Bearer ${token}`))
  })

  it('returns 401 when JWT_SECRET env var is not set', () => {
    delete process.env.JWT_SECRET

    const token = jwt.sign({ id: 1, email: 'x@x.com', role: 'admin' }, TEST_SECRET)
    expectUnauthorized(makeReq(`Bearer ${token}`))
  })

  it('does not expose internal error details in the response body', () => {
    const token = jwt.sign({ id: 1, email: 'x@x.com', role: 'admin' }, 'wrong-secret')
    const ctx = makeRes()
    const next = makeNext()

    authMiddleware(makeReq(`Bearer ${token}`) as Request, ctx.res as Response, next)

    const jsonMock = (ctx.res.status as jest.Mock).mock.results[0].value.json as jest.Mock
    const body = jsonMock.mock.calls[0][0] as Record<string, unknown>
    expect(Object.keys(body)).toEqual(['success', 'error'])
    expect(body.error).toBe('Unauthorized')
  })
})
