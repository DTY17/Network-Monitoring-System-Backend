import type { NextFunction, Request, Response } from "express"
import type { UserRole } from "../model/user.js"
import type { AUthRequest } from "./authentication.js"
import type { Role } from "../util/Role.js"

export const requireRole = (roles: Role[]) => {
  return (req: AUthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    
    const hasRole = roles.some((role) => req.user.roles?.includes(role))
    if (!hasRole) {
      return res.status(403).json({
        message: `Require ${roles} role`
      })
    }
    next()
  }
}
