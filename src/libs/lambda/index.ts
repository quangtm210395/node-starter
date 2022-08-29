import AWS from 'aws-sdk';

import { env } from '@Libs/env';

const lambda = new AWS.Lambda({
  region: env.aws.region,
  apiVersion: 'latest',
});

export async function invoke(name: string, params: any) {
  return lambda.invoke({
    FunctionName: name,
    Payload: JSON.stringify(params),
  }).promise();
}
