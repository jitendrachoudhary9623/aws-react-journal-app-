// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '9m0xu9ve24'
const region = 'ap-south-1' 
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
   domain: 'dev-zbmja3bs.auth0.com',            // Auth0 domain
   clientId: 'Ime7FDMyccgJqG0f2hUCvL0H90z4lUD7',          // Auth0 client id
   callbackUrl: 'http://localhost:3000/callback'
}