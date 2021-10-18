import Raceevent from './model'

class EventService {
  public async saveEvents (payload: any): Promise<any> {
    const race = new Raceevent(payload)
    return race.save(payload)
  }
}

export default EventService
