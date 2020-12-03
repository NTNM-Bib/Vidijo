# Vidijo Documentation

This folder contains the documentation for Vidijo. Its purpose is to provide an overview over the project and entrypoints for troubleshooting problems that might arise in the future when third-party dependencies change.

- [Vidijo Documentation](#vidijo-documentation)
  - [General Information](#general-information)
  - [Architecture](#architecture)
    - [App (Frontend)](#app-frontend)
    - [Services](#services)
      - [API Gateway](#api-gateway)
      - [API](#api)
      - [External Data Service](#external-data-service)
      - [Updater Service](#updater-service)
    - [Volumes](#volumes)
      - [MongoDB Volume](#mongodb-volume)
      - [Covers Volume](#covers-volume)
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

The backend consists of 3 different services using the [Express][express] framework and 1 reverse proxy (using [NGINX][nginx]). We use a single instance of [MongoDB][mongo] to store the majority of the data.

Each component of Vidijo runs inside their own container using [Docker][docker]. The entire architecture is configured to run inside containers for development and deployment.

More information about the architecture of the project and the interplay between components are described in the [following chapter](#architecture).

## Architecture

This section provides an overview over the architecture of Vidijo and how the services are connected. You can find more information about each service [below](#services).

![Architecture Overview](images/architecture.png)

The **orange-colored** entities and connections represent everything that is outside of the internal Vidijo network. We've got users on the left that want to access the Vidijo website and we also have our data sources on the right (DOAJ API and JournalTOCs Website). Since the connection to these entities runs over the internet, they are colored in orange.

Everything else is colored in **dark grey** and represents entities that belong to the internal network of Vidijo components. These components are connected via the local [Docker Bridge Network][docker-bridge] which is isolated from the internet. Since this local network is not reachable from outside, we can internally abandon access control for these services. The only exception is the API, which performs user authentication and authorization for incoming requests and delegates tasks to the other internal services.

### App (Frontend)

The code for the frontend application can be found in `/frontend/api`.

This is the frontend for Vidijo - it is written in [TypeScript][ts] using the [Angular][ng] framework.

The frontend gets build inside a temporary container and deployed inside another container using [NGINX][nginx].
It can be accessed by the public via the [API Gateway](#api-gateway) that redirects requests to the app container.

### Services

#### API Gateway

The code for the API Gateway can be found in `/backend/api-gateway`.

The API Gateway is the only service of Vidijo that is exposed to its users. Thats why it needs valid TLS certificates (updating certificates is described in the chapter [Maintenance](#maintenance)).

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

### Volumes

Volumes are used in Docker to provide persistent data storage. If we did not use volumes, we would lose all of our data when recreating containers. They also provide a way to share data between containers. This is especially useful for the [Covers Volume](#covers-volume).

#### MongoDB Volume

This volume is only mounted into the database container and provides persistent storage for our instance of MongoDB. In MongoDB, we save all journals, articles, users and more; basically everything except covers and the privacy policy.

#### Covers Volume

This volume contains all journal covers. It is used by the [API Gateway](#api-gateway) to make the covers accessible to the application, by the [External Data Service](#external-data-service) as a place to store the automatically downloaded covers and by the [API](#api) as a place to store uploaded covers.

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
[docker-bridge]: https://docs.docker.com/network/bridge/
[doaj]: https://doaj.org/
[jt]: http://www.journaltocs.ac.uk/
