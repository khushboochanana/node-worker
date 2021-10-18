import http from 'http'
import RaceEventService from '../model/raceEvents/service'
import config from '../config'

class EventsApi {
  private authInterval: any
  public token: string
  public eventService: RaceEventService

  constructor () {
    this.token = null
    this.eventService = new RaceEventService()
  }

  public async authenticateUser (): Promise<any> {
    return new Promise((resolve, reject) => {
      const data: string = JSON.stringify({
        email: 'kcfragrance.9@gmail.com',
        password: 'lTgAYaLP9jRs'
      })

      const options: any = {
        hostname: config.EVENT_API_HOST,
        path: '/auth',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }

      const req: any = http.request(options, res => {
        console.log(`Authentication statusCode: ${res.statusCode}`)
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Status Code: ${res.statusCode}`))
        }

        const data: any[] = []
        res.on('data', d => {
          data.push(d)
        })
        res.on('end', () => {
          const authData = Buffer.concat(data).toString()
          this.token = JSON.parse(authData)?.token
          resolve(this.token)
        })
      })

      req.write(data)
      req.on('end', () => {
        console.log('end')
      })
    })
  }

  public async getEvents (token: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const req = http.get(
          `http://${config.EVENT_API_HOST}/results`,
          {
            headers: {
              Authorization: `Bearer ${token || this.token}`
            }
          },
          async (res: any) => {
            try {
              if (res.statusCode < 200 || res.statusCode >= 300) {
                if (res.statusCode === 204) {
                  console.log('Re-Try')
                  req.destroy()
                  const token: any = await this.authenticateUser()
                  clearInterval(this.authInterval)
                  this.getEvents(token)
                } else {
                  return reject(new Error(`Status Code: ${res.statusCode}`))
                }
              }

              console.log(`Events statusCode: ${res.statusCode}`)
              const data: any[] = []
              res.on('data', (d: any) => {
                try {
                  data.push(d)
                  if (!this.authInterval) {
                    this.authInterval = setInterval(async () => {
                      console.log('Re-Authenticate')
                      req.destroy()
                      clearInterval(this.authInterval)
                      let token = await this.authenticateUser()
                      this.getEvents(token)
                    }, 5 * 60 * 1000)
                  }

                  const event = JSON.parse(Buffer.from(d).toString())
                  console.log('::Event received::', event)
                  this.eventService.saveEvents(event)
                } catch (err) {
                  console.log('::Error during event data process::', err)
                }
              })
              res.on('error', (err: any) => {
                console.log('err', err)
              })

              res.on('end', () => {
                resolve(Buffer.concat(data).toString())
              })
            } catch (err) {
              console.log('::Error during event receive::', err)
            }
          }
        )
        req.on('error', (err: any) => {
          console.log('error', err)
          this.authenticateUser()
        })

        req.on('end', () => {})
      } catch (err) {
        console.log(err)
      }
    })
  }
}

export default EventsApi
