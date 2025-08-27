import * as jose from 'jose'

export type JWT = {
  data: jose.JWTPayload
  exp?: string
}