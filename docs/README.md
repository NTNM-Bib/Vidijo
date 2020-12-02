# Vidijo Documentation

This folder contains the documentation for Vidijo.
Its purpose is to provide an overview over the project and entrypoints for troubleshooting problems that might arise in the future when third-party services change.

- [Vidijo Documentation](#vidijo-documentation)
  - [General Information](#general-information)
  - [Architecture](#architecture)
    - [Services](#services)
      - [API Gateway](#api-gateway)
      - [API](#api)
      - [External Data Service](#external-data-service)
      - [Updater Service](#updater-service)
      - [User Service](#user-service)
    - [Third-Party Services](#third-party-services)
      - [DOAJ API](#doaj-api)
      - [JournalTOCs Website](#journaltocs-website)
  - [Project Structure](#project-structure)
  - [Maintenance](#maintenance)
    - [Updating certificates](#updating-certificates)
    - [Troubleshooting](#troubleshooting)
      - [Downloading Journals](#downloading-journals)
      - [Downloading Articles](#downloading-articles)
      - [Automatic Cover Download](#automatic-cover-download)
      - [Third-Party Software](#third-party-software)

## General Information

Vidijo is developed with software from the [MEAN Stack][mean]. We use [TypeScript][ts] instead of JavaScript for frontend and backend service development.

The frontend uses [Angular][ng] as a framework and [Angular Material][ng-mat] as its User Interface library.

The backend consists of 4 different services using the [Express][express] framework and 1 reverse proxy (using [NGINX][nginx]). We use a single instance of [MongoDB][mongo] to store the majority of the data.

Each component of Vidijo runs inside their own container using [Docker][docker]. The entire architecture is configured to run inside containers for development and deployment.

More information about the architecture of the project and the interplay between components are described in the [following chapter](#architecture).

## Architecture

![Architecture Overview](images/architecture-overview.png)

### Services

#### API Gateway

The code for the API Gateway can be found in `/backend/api-gateway`.

The API Gateway is the only service of Vidijo that is exposed to the public. Thats why it needs valid TLS certificates (updating certificates is described in the chapter [Maintenance](#maintenance)).

Its job is to receive requests and redirect them to the according services.
An example: A user requests `https://vidijo.org/` - the gateway redirects the request to the frontend container and serves the client application.
Another example: The user requests `https://vidijo.org/api/v1/journals` - the gateway redirects the request to the API container and serves the JSON response containing journals.

#### API

The code for the API can be found in `/backend/api`.

The API connects the frontend with the entire backend. It performs user authentication and authorization and can handle tasks on its own like getting queried articles or journals from the database and sending them to the frontend.

Another important task is to receive requests from the client and delegate them to the other backend services. For example: An admin wants to add a new journal to Vidijo: the frontend sends a POST request to the API which delegates the task to the [External Data Service](#external-data-service).

This approach is used to provide a single interface between frontend and backend but also make is possible to separate areas of concern and not slow down the API with resource heavy tasks like fetching new articles from [DOAJ][doaj].

#### External Data Service

The code for this service can be found in `/backend/external-data.service`.

The job of this service is to be the bridge between external services and the Vidijo architecture. Its tasks are the following.

- search journals in [DOAJ][doaj]
- download journals from [DOAJ][doaj] and convert them to our own format
- download articles from [DOAJ][doaj] and convert them to our own format
- try finding a cover for newly added journals using the [JournalTOCs][jt] website
- sanitize incoming data (e.g. by removing HTML tags and duplicate authors)

#### Updater Service

The code for this service can be found in `/backend/updater.service`.

This service runs in the background and updates journals in a set interval (e.g. 1 journal every 10 minutes). It selects the journal that has not been updated for the longest time from our database and sends a command to the [External Data Service](#external-data-service) to fetch the articles of this journal from [DOAJ][doaj].

#### User Service

### Third-Party Services

#### DOAJ API

#### JournalTOCs Website

## Project Structure

## Maintenance

### Updating certificates

### Troubleshooting

We depend on third-party services to download journals, articles and covers and on multiple third-party packages to implement features.
Since software changes with time, some problems might occur that prevent Vidijo from working correctly.

This section aims to provide entrypoints for fixing problems that are caused by changing third-party software.

#### Downloading Journals

#### Downloading Articles

#### Automatic Cover Download

#### Third-Party Software

[mean]: https://en.wikipedia.org/wiki/MEAN_(solution_stack)
[ts]: https://www.typescriptlang.org/
[ng]: https://angular.io/
[ng-mat]: https://material.angular.io/
[mongo]: https://www.mongodb.com/
[express]: https://expressjs.com/
[nginx]: https://www.nginx.com/
[docker]: https://www.docker.com/
[doaj]: https://doaj.org/
[jt]: http://www.journaltocs.ac.uk/
