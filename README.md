# Bonymous

![](https://i.imgur.com/SroGTOb.png)

![](https://img.shields.io/github/license/takiyo0/Kazagumo)
![](https://img.shields.io/github/stars/Takiyo0/Kazagumo) ![](https://img.shields.io/github/forks/Takiyo0/Kazagumo) ![](https://img.shields.io/github/tag/Takiyo0/Kazagumo) ![](https://img.shields.io/github/release/Takiyo0/Kazagumo) ![](https://img.shields.io/github/issues/Takiyo0/Kazagumo)

Is an open source anonymous board that allows user to give their comment anonymously without letting people know who they are.

**Table of Contents**

- [Bonymous](#bonymous)
  * [Features](#features)
  * [Currently working on](#currently-working-on)
  * [Requirements](#requirements)
  * [Installation](#installation)
    + [Git](#git)
    + [Release](#release)
  * [Configuration](#configuration)
    + [Backend](#backend)
      - [MongoDB URI (required)](#mongodb-uri--required-)
      - [Secret (required)](#secret--required-)
      - [Database Type (optional)](#database-type--optional-)
      - [Google (required)](#google--required-)
      - [PostgreSQL Config (optional if you are using SQLite)](#postgresql-config--optional-if-you-are-using-sqlite-)
    + [Frontend](#frontend)
      - [Title (optional)](#title--optional-)
      - [Description (optional)](#description--optional-)
  * [Build](#build)
    + [Backend](#backend-1)
    + [Frontend](#frontend-1)
  * [Running](#running)
  * [Screenshots](#screenshots)
    + [Home](#home)
    + [Board](#board)
    + [Board edit](#board-edit)
    + [Search](#search)
    + [Code invite](#code-invite)
  * [Tutorials](#tutorials)
    + [Setting up your mongoDB](#setting-up-your-mongodb)
    + [More coming soon](#more-coming-soon)

## Features
1. Open source
2. Self-hosted
3. Anonymously send response/message
4. Fully animated
5. Search system
6. Self image hosting
7. Easy to use + setup
8. Modern UI
9. Mobile friendly
10. 3 Visibility type. public, unlisted, private
11. Using code system for unlisted board
12. Join/Leave board
13. Google auth for joining, or creating board
14. Supports 3 DBs (1 for main function, 2 for image hosting)

## Currently working on
1. Optimize loading animation
2. Make a setup UI and not use cli
3. Add user settings
4. Add admin panel

## Requirements
- **VPS/your own hosting** free VPSes are not recommended unless you want to take risk of losing data
- **Nodejs >16.9.0** (you can try lower version but at your own risk)
- **Mongodb**
- **PostgreSQL server** (not required if you are using sqlite for image hosting)
- **Google Auth Configs** for auth
- **Public IP/Adress** for public use. You can use nginx or apache

## Installation
### Git
1. `git clone https://github.com/Takiyo0/Bonymous`
2. `cd Bonymous`
3. `npm i && cd public && npm i && cd ../`

### Release
1. Download from the release
2. Extract the zip and open cmd
3. `cd Bonymous-master` (depend on the folder's name)
4. `npm i && cd public && npm i && cd ../`

## Configuration
### Backend
Rename `config.ts.example` to `config.ts` first
#### MongoDB URI (required)
Open config.ts and add your mongoDB URI inside `MONGODB_URI`
#### Secret (required)
Open config.ts and add whatever string you want for cookie secret
#### Database Type (optional)
Open config.ts and you can change the type to either `SQLite` or `PostgreSQL`
#### Google (required)
Open config.ts, and fill `GOOGLE` with your oauth json from google
#### PostgreSQL Config (optional if you are using SQLite)
Open config.ts and fill the required config


### Frontend
#### Title (optional)
Open .env file inside /public, and change `REACT_APP_TITLE=Bonymous` to whatever page title you want

#### Description (optional)
Open .env file inside /public, and change `REACT_APP_DESCRIPTION=Is an open-source anonymous board` to whatever page description you want

## Build
### Backend
1. Make sure you are in the root of project and open cmd
2. `npx tsc -w --outDir dist`
3. After you get `Found 0 errors. Watching for file changes.`, exit the process (ctrl+c / cmd+c)
4. Go to /dist and create a folder called `uploads`

### Frontend
1. Make sure you are in /public and open cmd
2. `npm run build`

## Running
1. `cd dist`
2. `node index.js` or `pm2 start index.js --name Bonymous`

## Screenshots
### Home
![homepage](https://i.imgur.com/vzWc9e7.png)
### Board
![board](https://i.imgur.com/CbmoU2i.png)
### Board edit
![edit](https://i.imgur.com/vuikh5f.png)
### Search
![search](https://i.imgur.com/f2HN10B.png)
### Code invite
![code invite](https://i.imgur.com/RGb281d.png)

## Tutorials
### Setting up your mongoDB
[![Setting up your mongoDB](https://img.youtube.com/vi/F2GgjHnP63w/0.jpg)](https://www.youtube.com/watch?v=F2GgjHnP63w)

### More coming soon
