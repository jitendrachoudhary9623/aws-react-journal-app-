import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment, Header, Tab } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditItem } from './components/EditItem'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Items } from './components/Items'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
        <div>
          <div style={{padding:'1%',background:'indigo',color:'white'}}>
            <div>
              <span style={{fontSize:'24px',fontWeight:'bolder'}}>
                Journal App</span>
                <Menu>
                  <Menu.Item name="home" style={{textColor:'purple'}}>
                    <Link to="/">Home</Link>
                </Menu.Item>
                <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
                </Menu>
              </div>
            
          </div>
          
          <Grid  stackable style={{margin:"1%"}}>
            <Grid.Row >
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
      </div>
    )
  }



  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Items {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/items/:itemId/edit"
          exact
          render={props => {
            return <EditItem {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
