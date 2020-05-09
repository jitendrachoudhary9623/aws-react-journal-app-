import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import moment from 'moment'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Segment,
  Form,
  Container,
  Card
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, updateItem, getUploadUrl, uploadFile } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'
import {UploadState} from '../components/EditItem'
import Jimp from 'jimp'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemTitle: string
  newItemDesc: string
  newItemImage: any
  loadingItems: boolean

  //image upload state
  uploadState: UploadState
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemTitle: '',
    newItemDesc: '',
    newItemImage: undefined,
    loadingItems: true,

    uploadState: UploadState.NoUpload
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemTitle: event.target.value })
  }

  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDesc: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      newItemImage: files[0]
    })
  }  

  handleSubmit = (event:React.SyntheticEvent) =>{
    this.onItemCreate(event)
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
  }

  onItemCreate = async (event: React.SyntheticEvent) => {
    try {
      console.log('image:', this.state.newItemImage)

      const newItem = await createItem(this.props.auth.getIdToken(), {
        title: this.state.newItemTitle,
        desc: this.state.newItemDesc
      })

      if(newItem)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newItem.itemId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.newItemImage)
      }

      this.setState({
        items: [...this.state.items, newItem],
        newItemTitle: '',
        newItemDesc: '',
        newItemImage: '',
        uploadState: UploadState.NoUpload
      })

      this.renderCreateItemInput()

      alert('Item was uploaded!')

    } catch(e) {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  
  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Grid>
          <Grid.Row>
          <Grid.Column width={7}>{this.renderCreateItemInput()}</Grid.Column>
          <Grid.Column width={1}><Divider vertical>{"Entries"}</Divider></Grid.Column>
          <Grid.Column width={8}> {this.renderItems()}</Grid.Column>
          </Grid.Row>
        </Grid>
        

       
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <div>

        {/* <Divider horizontal><h2>Write new diary</h2></Divider> */}
        <br/>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
              <label>Journal Title</label>
              <input
                type="text"
                placeholder="Enter Journal Title..."
                onChange={this.handleTitleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Journal Entry</label>
              <input
                type="text"
                placeholder="Enter Entry..."
                onChange={this.handleDescChange}
              />
            </Form.Field>
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="image/*"
                name="filePath"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>

            {this.renderButton()}

        </Form>
      </div>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      
      <Grid.Row>

        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <div>

        <Grid>
          {this.state.items.map((item, pos) => {
            return (
             <Card fluid>

              <Grid.Row centered={true} key={item.itemId} style={{margin:"2%",padding:"4%"}}>
                <Grid.Column width={12}>
                  <div>
                    <Image src={item.ImageUrl} />
                  </div>
                  <br/>
                  <div>
                    <h4>{item.title}</h4>
                  </div>
                  <br/>
                  <div>
                  <Header as='h5' block>
                  {item.desc}
                  </Header>
                  </div>
                  <br/>
                  <div>
                    <b>Updated at</b> :&nbsp;&nbsp;&nbsp;
                    {moment(item.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                  </div>
                  <br/>
                  <div>
                    <Button icon color="blue" onClick={() => this.onEditButtonClick(item.itemId)} >
                      <Icon name="pencil" /> Edit
                    </Button>
                    <Button icon color="red" onClick={() => this.onItemDelete(item.itemId)}>
                      <Icon name="delete" />  Delete
                    </Button>
                  </div>
                </Grid.Column>
                
              </Grid.Row>              
              </Card>
            )
          })}
        </Grid>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
          color="violet"
        >
          Submit
        </Button>
      </div>
    )
  }

  calculateCreateDate(): string {
    const date = new Date()

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  setUploadState(uploadState: UploadState)
  {
    this.setState({
      uploadState
    })
  }
}
