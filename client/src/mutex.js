
export default class Mutex {
  constructor() {
    this.pendingImp = []
    this.runningImp = false
    this.listenersImp = []
  }

  async runStep() {
    if (this.runningImp) return

    this.runningImp = true
    while (this.pendingImp.length > 0) {
      const func = this.pendingImp[0]
      try {
        await func()
      } catch (err) {
        console.error('Error in mutex')
        console.error(err)
      }
      this.pendingImp.shift()
    }
    this.runningImp = false
    this.notifyListeners()
  }

  attempt(func) {
    if (this.pendingImp.length > 0) return
    this.queue(func)
  }

  queue(func) {
    this.pendingImp.push(func)
    this.notifyListeners()
    this.runStep()
  }

  get free() {
    return this.pendingImp.length === 0
  }

  notifyListeners() {
    const free = this.free
    for (const listener of this.listenersImp) {
      listener(free)
    }
  }

  connectFree(listener) {
    this.listenersImp.push(listener)
    listener(this.free)
  }

  disconnectFree(listener) {
    const index = this.listenersImp.find(listener)
    if (index < 0) return
    this.listenersImp.splice(index, 1)
  }

}

