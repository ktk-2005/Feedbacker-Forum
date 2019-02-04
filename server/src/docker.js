import Docker from 'dockerode'
import fs from 'fs'
import os from 'os'
import {
  addContainer,
  listContainersByUser,
  removeContainer,
  setInstanceRunnerStatusSuccess,
  setInstanceRunnerStatusFail,
  createNewInstanceRunner
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
  if (type !== 'node') {
    throw Error(`createNewContainer: expected type 'node', was ${type}.`)
  }

  // Chooses a random port for the instance between the range [20 000 - 29 999].
  // The port is randomized because the Windows and OS X Docker versions
  // don't support connecting directly to different container IPs.
  const hostPort = Math.floor(20000 + Math.random() * 9999) || 0

  const opts = {
    name,
    Image: 'node-runner',
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
  // todo: size check
  logger.info(`Creating new instance logger: userId=${userId}, dockerTag=${dockerTag}, name=${name}`)

  // We won't wait for the promise to resolve because
  // especially with larger images it can take a while to download.
  // Instead, we update the download's status in the database.

  await createNewInstanceRunner(userId, dockerTag, name)

  docker.pull(dockerTag).then(async () => {
    await setInstanceRunnerStatusSuccess(dockerTag)
  }).catch(async (error) => {
    // update db with error status
    await setInstanceRunnerStatusFail(dockerTag)
    throw new NestedError('Unable to pull docker image', error, { functionArguments: { userId, dockerTag } })
  })
}
