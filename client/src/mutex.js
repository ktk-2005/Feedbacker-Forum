
export default class Mutex {
  constructor() {
    this.impQueued = 0
    this.impCompleted = 0
    this.impPromise = null
    this.impDone = () => {
      this.impCompleted += 1
      if (this.impCompleted == this.impQueued) {
        this.impPromise = null
      }
    }
  }

  attempt(func) {
    const pFunc = Promise.resolve(func).then(this.impDone).catch(this.impDone)
    if (!this.impPromise) {
      this.impQueued += 1
      this.impPromise = pFunc
      return pFunc
    } else {
      return Promise.resolve(null)
    }
  }

  queue(func) {
    const pFunc = Promise.resolve(func).then(this.impDone).catch(this.impDone)
    this.impQueued += 1
    if (this.impPromise) {
      this.impPromise.then(pFunc)
    }
    return pFunc
  }

  get free() {
    return !this.impPromise
  }

}

