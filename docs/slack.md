# Slack app

Feedbacker Forum has support for Slack but the Slack app needs to be
set up manually.

## Setting up

Slack app can be created at `https://api.slack.com/apps?new_app=1`. App's
name and Slack workspace where app is going to be used in are specified
here.

## Configuration

Slack app is now created and following steps are needed so that it can
work with Feedbacker Forum.

### Creating webhook

A webhook is used so that Feedbacker Forum can post messages to some Slack
channel via Slack app. Go to `Incoming Webhooks`, press toggle slide from
`off` to `on` and click `Add New Webhook to Workspace`. This redirects to
the Slack workspace and asks which channel Slack app is allowed to post
and authorization for creation of the webhook. After clicking `Authorization` Webhook URL is created.

### Setting up configs

Running either locally or on cloud provider, webhook, clientId and clientSecret
needs to be specified for Feedbacker Forum on some used `json` config file.
Add `"slack": { "clientId: "CLIENTID HERE", "clientSecret": "CLIENTSECRET HERE, "webhookURL": "WEBHOOKURL HERE"}` object to this `json`-file. More documentation
on this is available on `server-config.md`. Locally this should be done to
`/server/local.json` and then run `npm run watch -- -c local.json`. `webhookURL`
is obtained from `Incoming Webhooks`-section, `clientId` and `clientSecret` are
obtained from `Basic Information` of Slack app.

### Adding bot user

At section `Bot Users` new bot user can be added to Slack app. Display name and
Default username can be specified and whether the bot is always shown online or not. Clicking `Add Bot User` creates the bot.

### Slash commands

Slash commands can be created at `Slash Commands`-section. All available api-endpoints for slash commands can be seen on [api.md](api.md) and the path is of type
`/api/slack/commands/SOME_COMMAND`. On Slack app's `Slash Commands`-section corresponding slash commands can be created by `Create New Command`. Command, request URL to the slash command endpoint (like specified above) and short description of slash command needs to be specified here.

### OAuth and permissions

`Redirect URLs`and `Scopes` needs to be created in section `OAuth & Permissions`. Click on `Add New Redirect URL` to add redirect url for Slack authentication on Feedbacker Forum. This should be `https://DOMAIN_HERE/api/slack/oauth`. Next add permission by scope from dropdown menu and select `Confirm user's identity       identity.basic`-option. Click `Save Changes`.

## Installing Slack app

In section `Install App` click `Install App to Workspace`-button and authorize Slack app's installment to specified Slack workspace. Now Slack is ready to be used with Feedbacker Forum.

## Sending the first Slack message through the bot

When Slack app is up and running, go to running Feedbacker Forum instance dev dashboard and click `Sign in With Slack`. Afterwards container instances and survey edit pages show Slack icon or `Share in Slack` button. Clicking these buttons share the container instance on webhook's Slack channel.
