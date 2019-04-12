# Runners

Runners are Docker images that are used to build and run applications inside Feedbacker.

## Environment variables
When a runner starts, Docker passes two environment variables to the startup script, based on the user's input on the create page.

| Name | Description |
| ---- | ----------- |
| `GIT_CLONE_URL` | Contents of the Git URL field, except if the GitHub integration is used. In this case the contents are modified so that an access token is included in the URL. |
| `GIT_VERSION_HASH` | Contents of the version field. |

## Default runners
There are runners included with the project. Runners are located in the `:/docker/` folder. Runners must be built with Docker before they can be used with `docker build -t <name> <directory>`. After building configure the backend to present them as an option in the [server configuration](./server-config.md). The relevant configuration key is `runners`.

### node-runner

A very basic runner intended for running projects built with npm.

1. Clones the repository from `GIT_CLONE_URL`
2. Git resets to `GIT_VERSION_HASH`
3. Runs `npm install`
4. Runs `npm run start`

Supports container restarts.

## Writing runners

It's encouraged to write own runners for other types of applications and custom solutions. The runners can be then be built on the server itself and add them to the server configuration so that they will be available for all users.

It's also possible for users to upload their image to Docker Hub and pull images from there. The pulled images will be only accessible to the user that pulled them.

See the source code of `node-runner` in the `:/docker/node-runner/` directory for guidance on how to write other runners.

It doesn't matter if the application is included in the image, pre-installed, or if it's pulled when the container starts. There is, however, a size limit on the size of images which users can pull.

The `node-runner` runner is obviously written using the latter method because it needs to handle arbitrary applications. If an app is complex/slow to build, it might be better to prebuild the app and include it in the image.
