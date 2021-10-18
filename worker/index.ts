import EventApi from '../api/eventApi'

class EventWorker {
  public eventApi: any
  constructor () {
    this.eventApi = new EventApi()
    this.initateworker()
  }

  public async initateworker (): Promise<any> {
    try {
      const isauthenticated = await this.eventApi.authenticateUser()
      if (isauthenticated) {
        await this.eventApi.getEvents(isauthenticated)
      }
    } catch (err) {
      console.log(':: Worker Error:: ', err)
    }
  }
}

export default EventWorker
