import Docker from 'dockerode'
import {
  addContainer,
  listContainers,
  listContainersByUser,
  removeContainer
} from './database'

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

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

  const container = await docker.createContainer({
    Image: 'node-runner',
    Env: [
      `GIT_CLONE_URL=${url}`,
      `GIT_VERSION_HASH=${version}`,
    ],
  })

  await container.start()
  const containerInfo = await getContainerInfoFromDocker(container.id)

  const containerData = {
    id: containerInfo.Id,
    subdomain: name,
    ip: containerInfo.NetworkSettings.IPAddress,
    port,
    userId,
    blob: null,
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
