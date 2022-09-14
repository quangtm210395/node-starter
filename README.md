
<h1 align="center">Express TS Boilerplate</h1>


<p align="center">
  <b>A delightful way to building a simple Node.js RESTful API Services with beautiful code written in TypeScript.</b></br>
</p>

<br />

## ❯ Why

Our main goal with this project is a feature complete server application.
We like you to be focused on your business and not spending hours in project configuration.

Try it!! We are happy to hear your feedback or any kind of new features.

### Features

- **Dependency Injection** done with the nice framework from [TypeDI](https://github.com/typestack/typedi).
- **Clear Structure** with different layers such as controllers, services, repositories, models, middlewares...
- **Easy Exception Handling** thanks to [routing-controllers](https://github.com/typestack/routing-controllers).
- **Smart Validation** thanks to [class-validator](https://github.com/typestack/class-validator) with some nice annotations.
- **TypeORM** to simply query to SQL entities. [typeorm](https://github.com/typeorm/typeorm).
- **Mongoose** to simply query to mongodb models. [mongoose](https://github.com/Automattic/mongoose).
- **API Documentation** thanks to [swagger](http://swagger.io/) and [routing-controllers-openapi](https://github.com/epiphone/routing-controllers-openapi).
- **Basic Security Features** thanks to [Helmet](https://helmetjs.github.io/).
- **API Monitoring** thanks to [express-status-monitor](https://github.com/RafalWilinski/express-status-monitor).

## ❯ Table of Contents

- [Getting Started](#-getting-started)
- [Debugger in VSCode](#-debugger-in-vscode)
- [API Routes](#-api-routes)
- [Project Structure](#-project-structure)
- [Logging](#-logging)
- [Docker](#-docker)
- [Further Documentations](#-further-documentations)
- [Related Projects](#-related-projects)
- [License](#-license)


## ❯ Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

Install yarn globally

```bash
yarn global add yarn
```

Install a Mongodb database.

> If you work with a mac, we recommend to use homebrew for the installation.

### Step 2: Create new Project

Fork or download this project. Configure your package.json for your new project.

Then copy the `.env.example` file and rename it to `.env`. In this file you have to add your database connection information.

Create a new database with the name you have in your `.env`-file.

Then setup your application environment.

```bash
yarn install
```

> This installs all dependencies with yarn. After that it migrates the database and seeds some test data into it. So after that your development environment is ready to use.

### Step 3: Serve your App

Make sure you have docker (and docker-compose) installed on your machine. 
Go to the project dir and start your app with this yarn script.

```bash
yarn up-dev
```

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the server according to these changes.
> The server address will be displayed to you as `http://0.0.0.0:3000`.

After stopping your service, you can stop and remove all running docker container for development purpose (like redis, mongodb) by running this command `docker-compose down`.

## ❯ Scripts and Tasks

### Install

- Install all dependencies with `yarn install`

### Linting

- Run code quality analysis using `yarn lint`. This runs tslint.
- There is also a vscode task for this called `lint`.

### Running in dev mode

- Run `yarn up-dev` to start nodemon with ts-node, to serve the app.
- This script will run some docker containers for redis, mongodb in your machine and then run your service.
- The server address will be displayed to you as `http://0.0.0.0:3000`

### Remove development purpose containers

- Run `docker-compose down` to stop and remove all running redis, mongodb containers.
- Or you can run `yarn clean-setup` to remove and clean docker containers and volume related to this project.

### Building the project and run it

- Run `yarn build` to generated all JavaScript files from the TypeScript sources (There is also a vscode task for this called `build`).
- To start the builded app located in `dist` use `yarn start`.

## ❯ Debugger in VSCode

To debug your code run `yarn dev`
Then, just set a breakpoint and hit <kbd>F5</kbd> in your Visual Studio Code.


## ❯ API Routes

The route prefix is `/api` by default, but you can change this in the .env file.
The swagger and the monitor route can be altered in the `.env` file.

| Route          | Description |
| -------------- | ----------- |
| **/api**       | Shows us the name, description and the version of the package.json |requests |
| **/swagger-ui**   | This is the Swagger UI with our API documentation |
| **/monitor**   | Shows a small monitor page for the server |
| **/api/demo** | Example demo endpoint |


## ❯ Project Structure

| Name                              | Description |
| --------------------------------- | ----------- |
| **.vscode/**                      | VSCode tasks, launch configuration and some other settings |
| **dist/**                         | Compiled source files will be placed here |
| **src/**                          | Source files |
| **src/rests/controllers/**        | REST API Controllers |
| **src/rests/types/**              | Request/Response classes with validation rules if the body is not equal with a model |
| **src/errors/**                   | Custom HttpErrors like 404 NotFound |
| **src/middlewares/**              | Express Middlewares like helmet security features |
| **src/databases/**                | Mongoose / TypeORM Models |
| **src/repositories/**             | Repository layer |
| **src/services/**                 | Service layer |
| **src/decorators/**               | Custom decorators like @Logger |
| **src/jobs/**                     | Job and dispatcher handler |
| .env.example                      | Environment configurations |
| .env.test                         | Test environment configurations |


## ❯ Logging

Our logger is [winston](https://github.com/winstonjs/winston). To log http request we use the express middleware [morgan](https://github.com/expressjs/morgan).
We created a simple annotation to inject the logger in your service (see example below).

```typescript
import { Logger } from '@Decorators/Logger';
import { Logger as WinstonLogger } from 'winston';

@Service()
export class UserService {

    constructor(
        @Logger(module) private log: WinstonLogger
    ) { }

    ...
```
## ❯ Graphql Subscription
With normal Subscription you can check document from [TypeGraphql](https://typegraphql.com/docs/subscriptions.html).
But `@PubSub()` only work in `@Mutation` function, so we have some modify to make `@PubSub()` to work everywhere. Instead of using `@PubSub()` as a parameter of function. We can using `Container` to inject directly in class you want. Here is example:


```typescript
import { JsonController, Get } from 'routing-controllers';
import { PubSubEngine } from 'type-graphql';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/test')
export class BlockController {
  constructor(@Inject('pubSub') private pubSub: PubSubEngine) {}

  @Get('/send')
  public async send() {
    await this.pubSub.publish('NOTIFICATIONS', {});
    return 'hello world';
  }
}
```

## ❯ Docker

### Install Docker

Before you start, make sure you have a recent version of [Docker](https://docs.docker.com/engine/installation/) installed

### Build Docker image

```shell
docker build -t <your-image-name> .
```

### Run Docker image in container and map port

The port which runs your application inside Docker container is either configured as `PORT` property in your `.env` configuration file or passed to Docker container via environment variable `PORT`. Default port is `3000`.

#### Run image in detached mode

```shell
docker run -d -p <port-on-host>:<port-inside-docker-container> <your-image-name>
```

#### Run image in foreground mode

```shell
docker run -i -t -p <port-on-host>:<port-inside-docker-container> <your-image-name>
```

### Stop Docker container

#### Detached mode

```shell
docker stop <container-id>
```

You can get a list of all running Docker container and its ids by following command

```shell
docker images
```

#### Foreground mode

Go to console and press <CTRL> + C at any time.

### Docker environment variables

There are several options to configure your app inside a Docker container

#### project .env file

You can use `.env` file in project root folder which will be copied inside Docker image. If you want to change a property inside `.env` you have to rebuild your Docker image.

#### run options

You can also change app configuration by passing environment variables via `docker run` option `-e` or `--env`.

```shell
docker run --env DB_HOST=localhost -e DB_PORT=3306
```

#### environment file

Last but not least you can pass a config file to `docker run`.

```shell
docker run --env-file ./env.list
```

`env.list` example:

```
# this is a comment
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
```


## ❯ Further Documentations

| Name & Link                       | Description                       |
| --------------------------------- | --------------------------------- |
| [Express](https://expressjs.com/) | Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. |
| [TypeDI](https://github.com/pleerock/typedi) | Dependency Injection for TypeScript. |
| [routing-controllers](https://github.com/pleerock/routing-controllers) | Create structured, declarative and beautifully organized class-based controllers with heavy decorators usage in Express / Koa using TypeScript and Routing Controllers Framework. |
| [class-validator](https://github.com/pleerock/class-validator) | Validation made easy using TypeScript decorators. |
| [class-transformer](https://github.com/pleerock/class-transformer) | Proper decorator-based transformation / serialization / deserialization of plain javascript objects to class constructors |
| [Helmet](https://helmetjs.github.io/) | Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet, but it can help! |
| [Auth0 API Documentation](https://auth0.com/docs/api/management/v2) | Authentification service |
| [swagger Documentation](http://swagger.io/) | API Tool to describe and document your api. |


## ❯ Related Projects

- [Microsoft/TypeScript-Node-Starter](https://github.com/Microsoft/TypeScript-Node-Starter) - A starter template for TypeScript and Node with a detailed README describing how to use the two together.

## ❯ License

[MIT](/LICENSE)
