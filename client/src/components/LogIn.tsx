import * as React from 'react'
import Auth from '../auth/Auth'
import { Button } from 'semantic-ui-react'
import { Grid, Menu, Segment, Header, Tab } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <br/>
        <Grid>
          <Grid.Column textAlign="center">
          <Header as='h3' block>
            Login to continue
          </Header>
          <Button  onClick={this.onLogin} size="small" color="violet">
                Log in to Continue
              </Button>    
          </Grid.Column>
        </Grid>
      </div>

    )
  }
}
