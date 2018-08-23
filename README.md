# Violator bot

This is a fork and rewrite of [ESLint bot](https://github.com/Bernardstanislas/linter-bot).

Violator bot is a tool that will help your improve your code quality by linting it automatically with [ESLint](https://eslint.org) and [stylelint](https://stylelint.io) on every pull-request updates on your Github repository, and sending back reviews directly on Github.

Once plugged on your repo's webhooks, any pushed code will be linted, then commented directly on the commit page on Github.

## Installation

Clone the repo, then do a

```bash
yarn
```

*Optional* : create a new Github account for your bot, which will be used to author the comments.

## Configuration

You need to provide credentials to the Github account you want to use for the post-linting comments, as well as a file filter regex to determine whether a changed file should be linted or not.

This configuration gets taken from the environment, as follows :

```sh
GITHUB_USERNAME=username # Your bot's Github username
GITHUB_PASSWORD=password # Your bot's Github password
```

You also need to configure ESLint through the [config/eslintrc.js](http://eslint.org/docs/user-guide/configuring). That's where all your linting rules go.

Eventually, you'll need to register your bot as a webhook for the repo you want to lint. Simply go the the settings page of your repo and add a new webhook pointing at your server's URL. Leave all the other options at their default value.

## Deployment

You deploy the code to AWS as a Lambda function using the `serverless` toolkit.
This requires the `aws` command line utility, and the correct authorization details.
See the documentation for `aws` for how to do this.

The `serverless.yml` configuration references some variables from AWS Systems Manager Parameter store. Those are prefixed with `ssm:`.
Make sure they are defined in the region that you're deploying to.

Then run the deploy script:

```sh
yarn deploy
```
