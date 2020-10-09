<!-- @ https://github.com/othneildrew/Best-README-Template -->

[![Release][github-release-shield]][github-release-url]
[![GPL-3.0 License][license-shield]][license-url]
[![Repo Size][repo-size-shield]][vidijo-github-url]
[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]

<br />
<p align="center">
  <a href="https://github.com/NTNM-Bib/Vidijo">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Vidijo</h3>

  <p align="center">
    A web application for presenting a curated selection of open-access journals.
    <br />
    <br />
    <a href="https://www.vidijo.org">See In Action</a>
    ·
    <a href="https://github.com/NTNM-Bib/Vidijo/issues">Report Bug</a>
    ·
    <a href="https://github.com/NTNM-Bib/Vidijo/issues">Request Feature</a>
  </p>
</p>

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running In Production](#running-in-production)
  - [Running For Development](#running-for-development)
- [Usage](#usage)
  - [Administration](#administration)
  - [Install as an App](#install-as-an-app)
- [License](#license)
- [Contact](#contact)

## About The Project

[![Vidijo Screen Shot][product-screenshot]](https://www.vidijo.org/journals)

Vidijo is a virtual journal display for open-access journals. The app was developed within the [visOA](https://visoa.leibniz-inm.de/) project with the goal to make open-access publications more visible.
It can be used to browse a curated selection of journals and to quickly access the articles published in them.
By creating a personal user account, journals can be favored and articles can be stored in a reading list.

### Built With

- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- [Express](https://expressjs.com/)
- [Docker](https://www.docker.com/)

## Getting Started

You can try out the version of the NTNM library at [vidijo.org][vidijo-url]. More information on how to use the app can be found under [Usage](#usage). If you want to set up Vidijo with your own selection of open-access journals, you can learn more about configuring and deploying your own installation in the following sections.

### Prerequisites

- [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) must be installed on your server to run this application. Check out the [documentation](https://docs.docker.com/) on how to install both.
- An email account to send verification and password reset emails from
- A valid TLS/SSL certificate (free certificates are available on [Let's Encrypt](https://letsencrypt.org/))

### Installation

You can download the app from the [GitHub website][vidijo-github-url] or clone it using `git`:

```sh
git clone https://github.com/NTNM-Bib/Vidijo.git
```

After downloading the source code, continue with the section [Configuration](#configuration).

### Configuration

To configure the app, a few folders and files have to be created and adjusted. The project already contains example files and folders that can be used as templates. This may take a while but must only be done once.

1. `/config` folder

Locate the `config.example` folder at the **project root**. Make a copy of it and rename it to `config` (this folder must be in the same directory as the example folder). Open the folder and rename the 3 contained files:

- `api.example.env` to `api.env`
- `external-data.service.example.env` to `external-data.service.env`
- `shared.example.env` to `shared.env`

The result should look like this:

![Config Folder][config-folder]

Afterwards the 3 contained files must be adjusted as follows:

- `/config/api.env`

  - `SESSION_SECRET`: generate a long cryptographically random string (you can run `pwgen -s 96` to get secure values)
  - `MAIL_HOST`: the host of the mail service used for sending verification mails (e.g. mail.example.com)
  - `MAIL_USERNAME`: login username of the Vidijo mail account
  - `MAIL_PASSWORD`: login password of the Vidijo mail account
  - `INSTITUTION_NAME`: the name of your institution (will be displayed on the website besides the upper left logo)
  - `INSTITUTION_LOGO_URI`: the URI of your institution logo (e.g. https://vidijo.org/static/logos/vidijo.png)
  - `API_URI_HOSTED`: the URI of the API (in our case https://vidijo.org/api; replace vidijo.org with your domain)

- `/config/external-data.service.env`

  - `PUBLIC_COVER_URL`: the URI of the stored covers (in our case https://vidijo.org/static/covers; replace vidijo.org with your domain)

- `/config/shared.env`
  - `VIDIJO_URI`: the URI of your Vidijo installation (in our case https://www.vidijo.org; replace www.vidijo.org with your domain)

2. `/backend/api-gateway/config` folder

Locate the `config.example` folder at `/backend/api-gateway` and make a copy of it, and rename it to `config`. Also rename the contained folder `certificates.example` to `certificates`.

- Replace the file `certificate.example.cer` with your own certificate (you may have to combine the intermediate certificate and your websites certificate into one file using the following command: `cat website.cer intermediate.cer > certificate.cer`). The resulting file must be called `certificate.cer`
- Replace `private_key.example.key` with your own private key file (obtained when creating the certificate) and rename it to `private_key.key`
- Replace the `icon.example.png` file with your own icon and rename it to `icon.png`. Make sure that the icon is square (e.g. use a resolution of 96 x 96 pixels)
- Edit the `privacy-policy.example.html` file and save it as `privacy-policy.html`. This file is served when a user wants wants to read your privacy policy. You can use the provided template and edit the HTML body or create your own HTML file

The final config folder should look like this:

![API Gateway Config Folder][api-gateway-config-folder]

3. `/frontend/app/config` folder

Locate the `config.example` folder at `/frontend/app/config.example`, make a copy of it and rename the copied folder and the contained files like before.

- `environment.prod.ts`: you only have to change the value of `institutionName` to the name of your institution. In our case, we use "NTNM Library". This string will be displayed besides the main logo in the upper left corner on the website
- `icon.png`: you can reuse the icon you set in step 2 (`/backend/api-gateway/config/icon.png`). This icon is displayed as the main icon on the website and is used to generate an icon for Android and iOS

The final folder should look like this:

![App Config Folder][app-config-folder]

This concludes the configuration of the application. Please make sure that all files are named correctly; otherwise, the app won't run correctly. Check out the section [Running In Production](#running-in-production) to deploy your Vidijo installation. If you want to run the application in development mode instead, check out the section [Running For Development](#running-for-development).

### Running In Production

You can use the `run.sh` script to build and run the app in production.
You may have to elevate the permissions of `run.sh` first to execute the script (using `chmod`).
The first startup takes a while because dependencies have to be downloaded and installed. Subsequent starts will be much faster.

```sh
./run.sh
```

If you want to stop the application, you can use the `stop.sh` script. As before, you may need to elevate the permissions of `stop.sh` as well.

```sh
./stop.sh
```

### Running For Development

Running the application in development mode enables live code reloading for the backend services and the Vidijo frontend. Two files must be added to our configuration to make this mode work:

1. `/config.dev` folder

Locate the `config.dev.example` folder in the project root and make a copy of it; rename this copy to `config.dev`. The contained files must be renamed as well by removing ".example" from their names.

- `api.dev.env`: you can enter the values from `api.env` in the main `config` folder and change the domain of `INSTITUTION_LOGO_URI` and `API_URI_HOSTED` to `localhost` (e.g. https://localhost/static/logos/vidijo.png and https://localhost/api)
- `external-data.service.dev.env`: you can set the value of `PUBLIC_COVER_URL` to `https://localhost/static/covers`

The final folder should look like this:

![Config Dev Folder][config-dev-folder]

To start the app, use the script `run_dev.sh`.

```sh
./run_dev.sh
```

Stopping works with the `stop.sh` script as well.

```sh
./stop.sh
```

## Usage

![All Journals][product-screenshot]

This is the start screen on which all available journals are presented. Journals can be sorted by different criteria and filtered by categories. By clicking on a journal you can access its details view.

![Journal Detail View][journal-details-view]

In this view we find all articles published in this journal, sorted by publication date in descending order. By clicking on an article title, it expands and shows further details about the article, such as authors or the abstract. Clicking on the button "Open Article" takes us to the full text on the publisher's page.

The journal can be favored with the "Follow" button and articles can be added to the personal reading list with the "Save" button. These two functions are only available if you are logged in with your account.

![Home Page][home-page]

The "Home" page is our personal page. Favored journals and the reading list are stored there. In addition, the latest articles in our favorite journals are displayed at the top.

![Discover Page][discover-page]

On the "Discover" page we can see the latest articles of all available journals and browse suggested categories and journals.

### Administration

The first user who registers receives admin rights and can thus add, edit and delete journals and categories as well as grant admin rights to other users. To use the admin functions, the admin mode must be activated with the button in the upper right corner.

![Admin: Add Journal][admin-add-journal]

In admin mode, new journals can be added on the "All Journals" page. By clicking on "Add Journals" we can search for journals to be added.
By clicking on the pen icon next to each journal, its details can be edited (the title, identifier, cover and categories) or the journal can be deleted.

![Admin: Add Category][admin-add-category]

Creating and editing categories works similarly to managing journals - we just have to visit the categories page in admin mode and use the "Add Category" button or pen icons next to the available categories. When adding a category, we can choose to display it on the discover page. This also makes the category available in the dropdown menu on the "All Journals" page (opens when clicking on "All Journals").

### Install as an App

Vidijo can not only be used as a web site in the browser, but can also be installed on your device as a [progressive web app (PWA)](https://en.wikipedia.org/wiki/Progressive_web_application). To install the application as a PWA, you can click the "+" icon in the address bar in your browser (not all browsers might support this feature).

![Install PWA Desktop][install-pwa-desktop]

On mobile devices, you can use "Add To Home Screen" in your browser (Safari on iOS, Chrome on Android). Instead of opening the browser when clicking the added app icon, the application will be launched similarly to a native app.

## License

Distributed under the GPL-3.0 License. See `LICENSE.md` for more information.

## Contact

Uwe Geith _(Project Manager)_ - uwe.geith@leibniz-inm.de  
Thomas Kraß _(Developer)_ - krass@ntnm-bib.de

Source code available at: [https://github.com/NTNM-Bib/Vidijo][vidijo-github-url]

[contributors-shield]: https://img.shields.io/github/contributors/NTNM-Bib/Vidijo.svg?style=flat
[contributors-url]: https://github.com/NTNM-Bib/Vidijo/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/NTNM-Bib/Vidijo.svg?style=flat
[forks-url]: https://github.com/NTNM-Bib/Vidijo/network/members
[stars-shield]: https://img.shields.io/github/stars/NTNM-Bib/Vidijo.svg?style=flat
[stars-url]: https://github.com/NTNM-Bib/Vidijo/stargazers
[issues-shield]: https://img.shields.io/github/issues/NTNM-Bib/Vidijo.svg?style=flat
[issues-url]: https://github.com/NTNM-Bib/Vidijo/issues
[license-shield]: https://img.shields.io/github/license/NTNM-Bib/Vidijo.svg?style=flat
[license-url]: https://github.com/NTNM-Bib/Vidijo/blob/master/LICENSE.md
[repo-size-shield]: https://img.shields.io/github/repo-size/NTNM-Bib/Vidijo
[github-release-shield]: https://img.shields.io/github/v/release/NTNM-Bib/Vidijo?label=version
[github-release-url]: https://github.com/NTNM-Bib/Vidijo/releases
[product-screenshot]: images/screenshot.jpg
[vidijo-url]: https://www.vidijo.org
[vidijo-github-url]: https://github.com/NTNM-Bib/Vidijo
[api-gateway-config-folder]: images/installation/api-gateway-config-folder.png
[app-config-folder]: images/installation/app-config-folder.png
[config-folder]: images/installation/config-folder.png
[config-dev-folder]: images/installation/config-dev-folder.png
[journal-details-view]: images/usage/journal-details.png
[home-page]: images/usage/home-page.png
[discover-page]: images/usage/discover-page.png
[admin-add-journal]: images/usage/admin-add-journal.png
[admin-add-category]: images/usage/admin-add-category.png
[install-pwa-desktop]: images/usage/install-pwa-desktop.png
