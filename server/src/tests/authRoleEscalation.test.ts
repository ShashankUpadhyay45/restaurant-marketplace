import { describe, it, expect, vi } from 'vitest';
import { requireRole, verifyTenantIsolation, AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';

describe('RBAC & Tenant Isolation Security Tests', () => {
  it('forbids customer role from accessing restaurant_owner protected resource', () => {
    const req = {
      user: {
        _id: 'user_cust_1',
        role: 'customer'
      }
    } as unknown as AuthRequest;

    let statusCode: number | null = null;
    let jsonBody: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => { jsonBody = data; }
        };
      }
    } as unknown as Response;

    const next = vi.fn();

    const middleware = requireRole('restaurant_owner', 'admin');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusCode).toBe(403);
    expect(jsonBody.message).toContain("Forbidden. Role 'customer' is not authorized");
  });

  it('allows restaurant_owner role to pass requireRole', () => {
    const req = {
      user: {
        _id: 'user_owner_1',
        role: 'restaurant_owner'
      }
    } as unknown as AuthRequest;

    const res = {} as Response;
    const next = vi.fn();

    const middleware = requireRole('restaurant_owner');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('blocks restaurant owner from accessing data of a foreign restaurantId (Tenant Isolation)', () => {
    const req = {
      user: {
        _id: 'user_owner_1',
        role: 'restaurant_owner',
        restaurantId: 'rest_alpha_111'
      },
      params: {
        restaurantId: 'rest_beta_222' // Trying to tamper and access competitor data
      },
      body: {},
      query: {}
    } as unknown as AuthRequest;

    let statusCode: number | null = null;
    let jsonBody: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => { jsonBody = data; }
        };
      }
    } as unknown as Response;

    const next = vi.fn();

    verifyTenantIsolation(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusCode).toBe(403);
    expect(jsonBody.message).toContain('Security Violation: You are not authorized');
  });
});
