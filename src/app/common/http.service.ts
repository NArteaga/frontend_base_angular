import { Injectable, inject } from '@angular/core';
import axios from 'axios'
import { environment } from '@env'
import { StorageService } from '@common/storage.service';
import { AES } from 'crypto-js'

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private storage = inject(StorageService)
  constructor() { }

  execute = async (
    config: {
      method: string,
      url: string,
      headers?: Record<string, any>,
      data?: Record<string, any>
    }
  ) => {
    try {
      if (!config.headers) config.headers = {}
      let sendToken = false
      if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        config.url = `${environment.baseUrl.api}${config.url}`
        sendToken = true
      }
      const jwt = this.storage.local.getItem('token')
      if (jwt && sendToken) config.headers['Authorization'] = `Bearer ${jwt}`
      const result = await axios.request(config)
      if (!result?.data?.finalizado) return { error: result.data, result: null, type: 'error' };
      if (result?.data?.datos?.token) {
        this.storage.local.setItem('token', result.data?.datos?.token)
        delete result.data?.datos?.token
      }
      if (result?.data?.datos?.token) {
        this.storage.local.setItem('token', result.data?.datos?.token)
        delete result.data?.datos?.token
      }
      if (result?.data?.refreshToken) {
        this.storage.local.setItem('token', result.data?.refreshToken)
        delete result.data?.refreshToken
      }
      result.data.code = result.status
      return { error: null, result: result.data, type: 'success' };
    } catch (error: any) {
      let message: any = { mensaje: 'Error en la conexión', code: error.response?.status || 404 }
      try {
        message = JSON.parse(JSON.stringify(error?.response?.data))
        message.code = error.response?.status
        return { error: message.mensaje, result: null, type: 'error' };
      } catch (err) {} finally {
        return { error: message, result: null, type: 'error' };
      }
    }
  }

  executeCrypt = async (
    config: {
      method: string,
      url: string,
      headers?: Record<string, any>,
      data?: Record<string, any>
    },
    secret: string
  ) => {
    const identifier = AES.encrypt(JSON.stringify(config.data), secret).toString();
    return this.execute({
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: { identifier }
    })
  }

  query = (data: any) => {
    const query = new Array<string>();
    for (const key in data) {
      if (!Array.isArray(data[key])) {
        query.push(`${key}=${data[key]}`)
        continue;
      }
      for (const value of data[key])
        query.push(`${key}=${value}`)
    }
    return query.join('&')
  }
}
