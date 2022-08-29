import { Request, Response } from 'express';

import { GraphqlReqCredentials } from '@Libs/types/GraphqlReqCredentials';

export interface GraphqlContext {
  req: Request;
  res: Response;
  credentials?: GraphqlReqCredentials,
}
