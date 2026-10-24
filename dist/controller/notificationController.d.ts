import type { Request, Response } from "express";
export declare function get_all(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function save(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function get_id(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function delete_id(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function filter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCount(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUserHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAllHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function assignTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAssignedTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAllAssignedTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function connectSSH(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notificationController.d.ts.map