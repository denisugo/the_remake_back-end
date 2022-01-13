# The remake (back-end)

## Overview

This is the remake of my previous portfolio project. It is aimed for improving all the cons of the project. The Sql database remains the same, back-end part should be slightly upgraded, front-end will also get more features.

## Features

- JWT instead of redux
- Oauth
- Description of each function
- Simple back-end structure

## Comment styling

- // Should be used for commenting unused parts of code
- //\* Should be used for short describing of code parts, generally for introductions
- //? Should be used for more detailed describing of code
- // TODO: Should be used for leaving certain tasks within code
- //! Should be used for indicating of high priority notes

## Roadmap

### Front-end

- Refactor and add a fully functional validation on inputs
- Comment each component
- JWT should expire

### Back-end

- Refactor all middlewares
- Remove roles in SQL, so it can be published onto Heroku
- Cookie session should expire
- Get rid of query tests and refactor middleware tests

## Getting started

### Links

This is the API. It should work with [this client](https://github.com/denisugo/the_remake_front_end)

- All endpoints have the following prefix api/v1/
- The endpoint documentation is on api/docs/

### Initial setup

To make it work, you should setup the environment variables that are provided in the following lines:

```
PORT = 4000
ORIGIN = http://localhost:3000

SECRET_ENCRYPTION_KEY = micro_Cat
SECRET_STRIPE_KEY = Your_Stripr_SK_Key

DATABASE_URL = postgres://myuser:secret@localhost:5432/the_remake

NODE_ENV = development
```

 <br />

## SQL

![Diagram io](/Back-end-portfolio.png)

 <br />

## Pros & Cons

### Pros

- Tests cover all important database settings
- Well developed auth schema
- Easy-to-use endpoint documentation builded with _Swagger_

### Cons

- Nothing
