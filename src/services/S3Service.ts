import { Service } from 'typedi';
import aws from 'aws-sdk';
import winston from 'winston';
import uuid from 'uuid';
import { ObjectCannedACL } from 'aws-sdk/clients/s3';

import { Logger } from '@Decorators/Logger';

@Service()
export class S3Service {
  private s3: aws.S3;

  constructor(@Logger(module) private logger: winston.Logger) {
    this.s3 = new aws.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
  }

  async upload(
    data: Buffer | string,
    bucketName: string,
    prefix: string,
    key: string,
    contentType: string,
    acl: ObjectCannedACL = 'public-read',
  ): Promise<aws.S3.ManagedUpload.SendData> {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: bucketName,
          Key: `${prefix}/${key || uuid.v4()}`,
          ContentType: contentType,
          Body: data,
          ACL: acl,
        },
        (err: Error, data: aws.S3.ManagedUpload.SendData) => {
          if (err) {
            this.logger.error('upload:: Error when uploading file to S3: ', err);
            reject(err);
          }
          this.logger.info(`upload:: Upload file succeeded: ${data.Location}`);
          resolve(data);
        },
      );
    });
  }

  async cp(
    bucketName: string,
    prefix: string,
    key: string,
    source: string,
    acl: ObjectCannedACL = 'public-read',
  ): Promise<aws.S3.CopyObjectOutput> {
    return new Promise((resolve, reject) => {
      this.s3.copyObject(
        {
          Bucket: bucketName,
          Key: `${prefix}/${key || uuid.v4()}`,
          CopySource: source,
          ACL: acl,
        },
        (err: Error, data: aws.S3.CopyObjectOutput) => {
          if (err) {
            this.logger.error('cp:: Error when copy S3 Object: ', err);
            reject(err);
          }
          this.logger.info(`cp:: Copy object succeeded: ${data}`);
          resolve(data);
        },
      );
    });
  }
}
