import type { NextFunction, Request, Response } from "express";
export interface AUthRequest extends Request {
    user?: any;
}
export declare const Authenticate: (req: AUthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authentication.d.ts.map