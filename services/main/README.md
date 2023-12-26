# Mfoni API

## Manage Dependencies
> To install all dependencies, run the app. It'll resolve all dependencies you don't have locally before starting app.


`dotnet add package package-name` - install a package.
> Example: dotnet add package Swashbuckle.AspNetCore -v 6.5.0

## Running App
`make run-dev` - Run the development environment.

`make run` - Run the production environment.

`make run-staging` - Run the staging environment.

## Swagger Docs
Access the swagger docs on this route: `/swagger`. 
> Note: It is only available on the development/staging environments.