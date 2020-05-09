import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJASJUu+Lh96JpMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi16Ym1qYTNicy5hdXRoMC5jb20wHhcNMjAwNTAzMTEzMzQ5WhcNMzQw
MTEwMTEzMzQ5WjAhMR8wHQYDVQQDExZkZXYtemJtamEzYnMuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyy1Muum45EtVGrgKoNVHWGEP
s/Bs0mry5tCVMk5NyNs9Rlb3bIAabweWSi4rJUHqMouN0PlRlfxyWBVxifxB9NbX
pi7Tz/P8ciS3MRBcE5QDi2OgYXJzTWdGghoU3DVBR0hC8MbceuZl5NIWycnuf2he
By5MxZXfWVxX8pOoX0iTVLoVms8kdmB+MbAC5rA//3Z0UjY8jZOK9Yez1buaF5rN
hLWCrCxUNju2bqeOvRqbxbMElzoa2M4BJvQQz/rtRK7J9Bynx71ksznGS2hy0K91
6jygvcSjPJ7y6R12VBZAi3DrmL0zjjHnSzUgyFnHS2Y6LqgQb1YfgpE6ATNs+QID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT+6IfbxNuusp94lyia
hB+mjIn+xDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAETVRX4A
fQJ9Ji0LT/sCMNGr67NUHPKmIPfHeAdu1eshOVyS/QJTznLkGYGsZhU+1dHtuw+n
mJFuttHbRoM73AO+g7LVf9BwoLr3Mfs3uI/wHe5DRzzDW+lUVDJYkDXmNROc1pw7
HmN/pOfy7uE74YOoYvHmIP8XrLc7kxM3uubLPwCLoD7T7JMO2WxGOoXX0hNaaSyS
T7QwvjvtIYVujgYfgeig+jWFnejaBVi6dLTcBeNcslEDmNAZWAVDTYCy7aQUwJTa
ONMmfDWHjZKCMbwGzuj6bG9385JoSki47YmRIUVYn41AorWN5BPocYLZ6w95TTgd
9SWdvnHV4BEtlZM=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log(jwt, Axios, verify, jwt)

  return verify(token, cert,  { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
