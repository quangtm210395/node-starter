import { defaultMetadataStorage as classTransformerMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

import { env } from '@Libs/env';

export const swaggerSetup = (app: Express) => {
  if (env.swagger.enabled) {
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
      classTransformerMetadataStorage,
    });

    const baseUrl = `${env.app.schema}://${env.app.host}:${env.app.externalPort}`;
    const spec = routingControllersToSpec(
      getMetadataArgsStorage(),
      {},
      {
        components: {
          schemas,
          securitySchemes: {
            BearerToken: {
              type: 'http',
              name: 'Bearer Token',
              scheme: 'bearer',
              description: 'Pass the jwt accessToken',
              bearerFormat: 'JWT',
            },
          },
        },
        info: {
          title: `${env.app.name} Swagger API Documentation`,
          description: `${baseUrl}${env.swagger.route}`,
          version: '1.0.0',
        },
      },
    );

    // Add npm infos to the swagger doc

    spec.servers = [
      { url: `${baseUrl}${env.app.externalRoutePrefix}` },
      { url: `http://localhost:${env.app.port}${env.app.routePrefix}` },
    ];

    app.use(env.swagger.route, swaggerUi.serve, swaggerUi.setup(spec));

    app.use(env.swagger.apiDocs, (req: any, res: any) => {
      const { host } = req.headers;
      res.status(200).send({ ...spec, host });
    });
  }
};
