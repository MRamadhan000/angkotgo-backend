<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Vehicle and Driver API Documentation

# Driver API

## 1.Get All Drivers

### Request

```http
GET http://localhost:3000/drivers
```

### Response

Status : `200 OK`

```json
[
  {
    "id": 1,
    "name": "M. Ramadhan Titan",
    "phone": "081234567890",
    "licenseNumber": "SIM-9999-12345",
    "status": "ACTIVE",
    "createdAt": "2026-07-07T15:51:23.624Z",
    "updatedAt": "2026-07-07T15:51:23.624Z"
  },
  {
    "id": 3,
    "name": "AgusA",
    "phone": "081234567891",
    "licenseNumber": "SIM-9299-12345",
    "status": "INACTIVE",
    "createdAt": "2026-07-07T15:56:25.184Z",
    "updatedAt": "2026-07-07T19:02:20.227Z"
  }
]
```

---

## 2.Get Driver By ID

### Request

```http
GET http://localhost:3000/drivers/1
```

### Response

Status : `200 OK`

```json
{
  "id": 1,
  "name": "M. Ramadhan Titan",
  "phone": "081234567890",
  "licenseNumber": "SIM-9999-12345",
  "status": "ACTIVE",
  "createdAt": "2026-07-07T15:51:23.624Z",
  "updatedAt": "2026-07-07T15:51:23.624Z"
}
```

---

## 3.Create Driver

### Request

```http
POST http://localhost:3000/drivers
```

Body

```json
{
  "name": "Agus",
  "phone": "081234567830",
  "licenseNumber": "SIM-9299-12345",
  "status": "ACTIVE"
}
```

### Response

Status : `201 Created`

```json
{
  "id": 4,
  "name": "Agus",
  "phone": "081234567833",
  "licenseNumber": "SIM-9299-12245",
  "status": "ACTIVE",
  "createdAt": "2026-07-08T04:40:18.604Z",
  "updatedAt": "2026-07-08T04:40:18.604Z"
}
```

---

## 4.Update Driver

### Request

```http
PATCH http://localhost:3000/drivers/4
```

Body

```json
{
  "name": "Adam",
  "phone": "081234567833",
  "licenseNumber": "SIM-9299-12245",
  "status": "ACTIVE"
}
```

### Response

Status : `200 OK`

```json
{
  "id": 4,
  "name": "Adam",
  "phone": "081234567833",
  "licenseNumber": "SIM-9299-12245",
  "status": "ACTIVE",
  "createdAt": "2026-07-08T04:40:18.604Z",
  "updatedAt": "2026-07-08T04:41:11.894Z"
}
```

---

## 5.Delete Driver

### Request

```http
DELETE http://localhost:3000/drivers/4
```

### Response

Status : `200 OK`

```json
{
  "id": 4,
  "name": "Adam",
  "phone": "081234567833",
  "licenseNumber": "SIM-9299-12245",
  "status": "INACTIVE",
  "createdAt": "2026-07-08T04:40:18.604Z",
  "updatedAt": "2026-07-08T04:42:18.150Z"
}
```

# Vehicle API

## 1.Get All Vehicles

### Request

```http
GET http://localhost:3000/vehcicles
```

### Response

Status : `200 OK`

```json
[
  {
    "id": 1,
    "plateNumber": "N 1234 AB",
    "vehicleCode": "AG-01",
    "capacity": 12,
    "status": "ACTIVE",
    "createdAt": "2026-07-08T04:28:43.840Z",
    "updatedAt": "2026-07-08T04:28:43.840Z"
  },
  {
    "id": 4,
    "plateNumber": "N 1233 AB",
    "vehicleCode": "AG-02",
    "capacity": 12,
    "status": "INACTIVE",
    "createdAt": "2026-07-08T04:29:24.117Z",
    "updatedAt": "2026-07-08T04:30:26.098Z"
  }
]
```

---

## 2.Get Driver By ID

### Request

```http
GET http://localhost:3000/vehicles/4
```

### Response

Status : `200 OK`

```json
{
  "id": 4,
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "ACTIVE",
  "createdAt": "2026-07-08T04:29:24.117Z",
  "updatedAt": "2026-07-08T04:29:24.117Z"
}
```

---

## 3.Create Driver

### Request

```http
POST http://localhost:3000/vehicles
```

Body

```json
{
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "ACTIVE"
}
```

### Response

Status : `201 Created`

```json
{
  "id": 4,
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "ACTIVE",
  "createdAt": "2026-07-08T04:29:24.117Z",
  "updatedAt": "2026-07-08T04:29:24.117Z"
}
```

---

## 4.Update Driver

### Request

```http
PATCH http://localhost:3000/vehicles/4
```

Body

```json
{
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "MAINTENANCE"
}
```

### Response

Status : `200 OK`

```json
{
  "id": 4,
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "MAINTENANCE",
  "createdAt": "2026-07-08T04:29:24.117Z",
  "updatedAt": "2026-07-08T04:30:04.234Z"
}
```

---

## 5.Delete Driver

### Request

```http
DELETE http://localhost:3000/vehicles/4
```

### Response

Status : `200 OK`

```json
{
  "id": 4,
  "plateNumber": "N 1233 AB",
  "vehicleCode": "AG-02",
  "capacity": 12,
  "status": "INACTIVE",
  "createdAt": "2026-07-08T04:29:24.117Z",
  "updatedAt": "2026-07-08T04:30:26.098Z"
}
```

---

# Error Response

## Validation Error

Status : `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": ["phoneNumber should not be empty"],
  "error": "Bad Request"
}
```

---

## Not Found

Status : `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Driver not found"
}
```

---

## Conflict

Status : `409 Conflict`

```json
{
  "statusCode": 409,
  "message": "Phone number or license number already exists"
}
```
