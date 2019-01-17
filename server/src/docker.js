import Docker from 'dockerode'
import {
  addContainer,
  listContainers,
  listContainersByUser,
  removeContainer
} from './database'
import { config } from './globals'

let docker = null

export function initializeDocker() {
  let opts = { }

  if (config.dockerUrl) {
    const [url, port] = config.dockerUrl.split(':')
    opts.host = url
    opts.port = parseInt(port)
  } else if (/^win/.test(process.platform)) {
    opts.socketPath = '//./pipe/docker_engine'
  } else {
    opts.socketPath = '/var/run/docker.sock'
  }

  docker = new Docker(opts)
}

async function getContainerInfoFromDocker(id) {
  return docker.getContainer(id).inspect()
}

async function getContainerInfoFromDatabase() {
  return listContainers()
}

export async function getRunningContainers() {
  return getContainerInfoFromDatabase()
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

async function getContainerInfoFromDatabaseByUser(userId) {
  return listContainersByUser(userId)
}

export async function getRunningContainersByUser(userId) {
  return getContainerInfoFromDatabaseByUser(userId)
}

export async function createNewContainer(url, version, type, name, port, userId) {
  if (type !== 'node') {
    throw Error(`createNewContainer: expected type 'node', was ${type}.`)
  }

  const hostPort = Math.floor(20000 + Math.random() * 9999) | 0

  const opts = {
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

  console.log('Creating container', JSON.stringify(opts))

  const container = await docker.createContainer(opts)

  await container.start()
  const containerInfo = await getContainerInfoFromDocker(container.id)

  const containerData = {
    id: containerInfo.Id,
    subdomain: name,
    userId,
    blob: null,
    url: `http://localhost:${hostPort}`
  }

  try {
    await addContainer(containerData)
  } catch (error) {
    console.log(`Failed to add container to database. Error: ${error}`)
    console.log(`Stopping and removing the docker container with id: ${container.id}`)

    try {
      await container.stop()
      await container.remove()
    } catch (error) {
      console.log(`Failed to stop and remove docker containers... Error: ${error}`)
    }
  }

  return { id: containerInfo.Id, name }
}

export async function stopContainer(id) {
  const container = await docker.getContainer(id)
  await container.stop()
}

export async function deleteContainer(id) {
  const container = await docker.getContainer(id)
  await container.remove()
  await removeContainer(id)
}
