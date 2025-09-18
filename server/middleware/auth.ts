
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // In a real app, you'd verify JWT token here
  // For now, we'll check if user info is passed in headers (basic implementation)
  const userHeader = req.headers['x-user-info'];
  
  if (!userHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = JSON.parse(userHeader as string);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
}
