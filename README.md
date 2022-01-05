# Getting started

## Links

This is the API. It should work with [this client](https://github.com/denisugo/next-client-portfolio)

- All endpoints have the following prefix api/v1/
- The endpoint documentation is on api/docs/

## Initial setup

To make it work, you should setup the environment variables that are provided in the following lines:

```
PORT = 4000
ORIGIN = http://localhost:3000

SECRET_ENCRYPTION_KEY = micro_Cat
SECRET_STRIPE_KEY = Your_Stripr_SK_Key

SQL_USER = Your_SQL_Username
SQL_PASSWORD = Your_SQL_Password
SQL_PORT = 5432
SQL_HOST = localhost
SQL_DATABASE = Your_SQL_DB_Name
```

 <br />

# SQL

![Diagram io](/Back-end-portfolio.png)

 <br />

# Pros & Cons

## Pros

- Several roles are used in the database to improve authorization
- Tests cover all important database settings
- Well developed auth schema
- Easy-to-use endpoint documentation builded with _Swagger_
- All SQL query function could be reused in other projects

## Cons

- Query scripts don't provide proper check, if some SQL constrain rules are violeted. It just returns _undefined_ when an error is trown
