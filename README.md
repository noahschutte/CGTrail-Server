# Crimson and Gold Trail - Client
www.CrimsonAndGoldTrail.com

## Server Repository
https://github.com/noahschutte/CGTrail-Server

## Setup Instructions
### Global dependencies:
- node
- npm

### Run Locally
1. `npm install`
1. `mv configs/exampleConfig.json configs/config.json`
1. `npm run start`
1. Open in browser: `localhost:8000/businesses`

### Seed db
1. `npm run seed`

### How to contribute
#### Add heroku to git remotes
1. `git pull origin master:master`
1. `heroku login`
1. Enter heroku username and password.
1. `git remote -v`
```
origin	https://github.com/noahschutte/CGTrail-Server.git (fetch)
origin	https://github.com/noahschutte/CGTrail-Server.git (push)
```
1. `git remote add staging-heroku https://git.heroku.com/staging-cgtrail-server.git`
1. `git remote add prod-heroku https://git.heroku.com/cgtrail-server.git`
1. `git remote -v`
```
origin	https://github.com/noahschutte/CGTrail-Server.git (fetch)
origin	https://github.com/noahschutte/CGTrail-Server.git (push)
prod-heroku	https://git.heroku.com/cgtrail-server.git (fetch)
prod-heroku	https://git.heroku.com/cgtrail-server.git (push)
staging-heroku	https://git.heroku.com/staging-cgtrail-server.git (fetch)
staging-heroku	https://git.heroku.com/staging-cgtrail-server.git (push)
```

#### Open Site in Staging
`npm run open-staging`

#### Open Site in Production
`npm run open-prod`

### How to deploy
##### Deploy your feature branch to staging env
`git push staging-heroku {{yourFeatureBranchName}}:master`

##### Deploy to staging env
`npm run deploy-staging`

##### Deploy to production env
`npm run deploy-prod`
