# GitHub integration

It's possible to extend the basic functionality of Feedbacker to give it access to private GitHub repositories. This is possible by registering a [GitHub App](https://developer.github.com/apps/), which the developer users can install to their repository or organization.

## Installing the public Github App
The Feedbacker GitHub App can be found [here](https://github.com/apps/feedbacker-forum).

## Developer guide
Step-by-step tutorial for creating a new GitHub App, installing it for testing and configuring Feedbacker to use it.

### 1. Creating a GitHub App
Follow the steps [here](https://developer.github.com/apps/building-github-apps/creating-a-github-app/).
* User authorization callback URL is `(localhost:8080)/api/github/oauth2callback`
* The app only needs read-permission for repository contents
* It doesn't need any subscriptions
* For developer use select "Only on this account"

### 2. Install it

Follow the steps [here](https://developer.github.com/apps/managing-github-apps/modifying-a-github-app/) to open your app's settings. Then select `Install App` from the sidebar. Install it on all or some repositories.

### 3. Configure Feedbacker

Now choose the `General` tab from the sidebar and copy the app id, client id, client secret and generate a private key at the end of the page. Set these values according to the GitHub configuration described in [server-config.md](server-config.md). For the private key, replace newlines in the file with `\n` and it will work.
