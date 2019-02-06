import Docker from 'dockerode'
import fs from 'fs'
import os from 'os'
import R from 'ramda'
import {
  addContainer,
  listContainersByUser,
  removeContainer,
  setInstanceRunnerStatusSuccess,
  setInstanceRunnerStatusFail,
  createNewInstanceRunner,
  listInstanceRunnerOwnersByTag,
  deleteInstanceRunnerForUser,
  confirmInstanceRunnerOwnership
} from './database'
import { config } from './globals'
import logger from './logger'
import { NestedError, HttpError } from './errors'

// Docker socket handle, set in `initializeDocker` when server is started.
let docker = null

// Initializes the `docker` variable to the docker socket path
// for the current operating system.
export function initializeDocker() {
  const opts = { }

  if (config.dockerUrl) {
    const [url, port] = config.dockerUrl.split(':')
    opts.host = url
    opts.port = parseInt(port, 10)
  } else if (/^win/.test(process.platform)) {
    if (config.dockerWindows) {
      opts.socketPath = '//./pipe/docker_engine'
    } else {
      // TODO: be able to define these from the config file
      const basePath = `${os.homedir()}/.docker/machine/machines/default`
      opts.host = '192.168.99.100'
      opts.protocol = 'https'
      opts.ca = fs.readFileSync(`${basePath}/ca.pem`)
      opts.cert = fs.readFileSync(`${basePath}/cert.pem`)
      opts.key = fs.readFileSync(`${basePath}/key.pem`)
      opts.port = 2376
    }
  } else {
    opts.socketPath = '/var/run/docker.sock'
  }

  docker = new Docker(opts)
}

// Methods for retrieving data from the Docker API or from the database

async function getContainerInfoFromDocker(id) {
  return docker.getContainer(id).inspect()
}

export async function getRunningContainersByUser(userId) {
  const trackedContainers = await listContainersByUser(userId)
  return Promise.all(trackedContainers.map(async (container) => {
    const containerCopy = container
    const dockerContainerInfo = await getContainerInfoFromDocker(container.id)
    containerCopy.running = dockerContainerInfo.State.Running
    return containerCopy
  }))
}

export async function getContainerLogs(id) {
  const container = await docker.getContainer(id)
  const muxedBuffer = await container.logs({
    follow: false,
    stdout: true,
    stderr: true,
    timestamps: true,
  })

  return muxedBuffer
}

/* Operational methods */

export async function createNewContainer(url, version, type, name, port, userId) {
  // Check if the specified instance runner exists AND if it's a custom runner, that
  // the user has created it themselves.

  if (R.none(runner => runner.tag === type, config.runners)) {
    // Caveat: this check only considers the `userId` passed to this method.
    // It's possible the user would own the runner on some other userId than the
    // one that was selected to be used on this method. Better to just remove multi-user support?
    const dummyUserObject = {}
    dummyUserObject[userId] = null
    const ownerId = await confirmInstanceRunnerOwnership(type, dummyUserObject)

    if (!ownerId) {
      throw new HttpError(400, `Invalid runner type: "${type}"`)
    }
  }

  // Chooses a random port for the instance between the range [20 000 - 29 999].
  // The port is randomized because the Windows and OS X Docker versions
  // don't support connecting directly to different container IPs.
  const hostPort = Math.floor(20000 + Math.random() * 9999) || 0

  // Caveat: this binds the port on *all* interfaces. This is a security risk, because
  // you can get access to all containers by just bruteforcing the port on the host.
  const opts = {
    name,
    Image: type,
    ExposedPorts: { [`${port}/tcp`]: {} },
    HostConfig: {
      PortBindings: {
        [`${port}/tcp`]: [{ HostPort: `${hostPort}` }],
      },
    },
    Env: [
      `GIT_CLONE_URL=${url}`,
      `GIT_VERSION_HASH=${version}`,
    ],
  }

  // Create the container and start it. We'll get the unique id
  // only after the container has started.
  const container = await docker.createContainer(opts)
  await container.start()
  const containerInfo = await getContainerInfoFromDocker(container.id)

  const containerData = {
    id: containerInfo.Id,
    subdomain: name,
    userId,
    blob: null,
    url: `http://localhost:${hostPort}`,
  }

  logger.info(`Container created and started. Id: ${containerData.id}`)

  // This try-catch construction is meant to try to revert both docker and database
  // to a clean state if something goes wrong.
  try {
    await addContainer(containerData)
  } catch (error) {
    try {
      await container.remove({ force: true })
    } catch (error2) {
      throw new NestedError('Unable to add container to database and unable to remove container from docker.', NestedError.fromError(error2, error), containerData)
    }
    throw new NestedError('Couldn\'t add container to database, but removed the created container successfully.', error)
  }

  return { id: containerInfo.Id, name }
}

export async function startContainer(id) {
  const container = await docker.getContainer(id)
  if ((await container.inspect()).State.Running) {
    throw new HttpError(400, 'Instance is already running.')
  }
  await container.start()
}

export async function stopContainer(id) {
  const container = await docker.getContainer(id)
  if (!(await container.inspect()).State.Running) {
    throw new HttpError(400, 'Instance is already stopped.')
  }
  await container.stop({
    // Default timeout is 10s
    t: 5,
  })
}

export async function deleteContainer(id) {
  const container = await docker.getContainer(id)
  await container.remove({
    force: true,
  })
  await removeContainer(id)
}

export async function createNewRunner(userId, dockerTag, name) {
  logger.info(`Creating new instance runner ${dockerTag}`)

  await createNewInstanceRunner(userId, dockerTag, name)

  // We won't wait for the promise to resolve because
  // especially with larger images it can take a while to download.
  // Instead, we update the download's status in the database.

  // It should also be noted that this updates the image for all other
  // users too if they use the same tag.

  docker.pull(dockerTag).then(async () => {
    logger.info(`Pulled or updated image ${dockerTag} successfully.`)
    // Not the best place for the size check but it kinda works
    // TODO: check before pulling
    const image = await docker.getImage(dockerTag)
    console.log(image)
    const imageInfo = await image.inspect()
    console.log(imageInfo)
    const imageSize = imageInfo.Size
    logger.info(`Pulled image, size is ${imageSize}`)
    if (imageSize > config.imageMaxSize) {
      image.remove({ f: true })
      throw new NestedError(`Image size is ${imageSize} (over ${config.imageMaxSize})`)
    }

    await setInstanceRunnerStatusSuccess(dockerTag)
  }).catch(async (error) => {
    // update db with error status
    await setInstanceRunnerStatusFail(dockerTag)
    logger.error(new NestedError('Unable to pull docker image', error, { functionArguments: { userId, dockerTag } }))
  })
}

export async function deleteRunner(dockerTag, userId) {
  // Determine if other users are using the image. Only delete it from disk if
  // the last user deletes it.

  deleteInstanceRunnerForUser(userId, dockerTag)
  const duplicateOwners = await listInstanceRunnerOwnersByTag(dockerTag)
  if (duplicateOwners.length === 0) {
    const image = docker.getImage(dockerTag)
    image.remove({ f: true })
  }
}
