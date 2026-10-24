import type { NextFunction, Response } from "express";
import type { AUthRequest } from "./authentication.js";
import type { Role } from "../util/Role.js";
export declare const requireRole: (roles: Role[]) => (req: AUthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=rolecheck.d.ts.map