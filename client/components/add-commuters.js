/* globals alert, FileReader */

import {csvParse} from 'd3-dsv'
import omit from 'lodash.omit'
import React, {Component, PropTypes} from 'react'
import {Accordion, Button, Col, Grid, Panel, Row} from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import Modal from 'react-modal'

import BackButton from '../containers/util/back-button'
import {pageview} from '../utils/analytics'

let uniqueid = 1

export default class AddCommuters extends Component {
  static propTypes = {
    // dispatch
    createCommuters: PropTypes.func.isRequired,

    // props
    commuters: PropTypes.array.isRequired,
    site: PropTypes.object.isRequired
  }

  state = {
    loading: false
  }

  componentWillMount () {
    pageview('/site/bulk-add-commuters')
  }

  _handleSubmit = () => {
    const {createCommuters} = this.props
    const commutersToCreate = this.state.newCommuters
      ? this.state.newCommuters.map((commuter) => omit(commuter, '_id'))
      : []

    this.setState({ loading: true })

    setTimeout(() => {
      createCommuters(commutersToCreate)
    }, 500)
  }

  _onSelectFile = (event) => {
    const {files} = event.target
    if (!files || files.length === 0) return alert('No File Selected!  Please select a file.')
    const {site} = this.props
    const r = new FileReader()

    r.onload = (e) => {
      const newCommuters = csvParse(e.target.result, (row) => {
        const {address, name} = row
        const _id = row._id || ++uniqueid
        // TODO: parse more field possibilities (first name, last name, etc)
        const newCommuter = {address, _id, name}
        newCommuter.siteId = site._id
        return newCommuter
      })

      this.setState({newCommuters})
    }

    r.readAsText(files[0])
  }

  render () {
    const {commuters, site} = this.props
    const {newCommuters} = this.state ? this.state : {}
    const newCommutersUploaded = newCommuters && newCommuters.length > 0
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <h3>
              <span>Add Commuters to Site {site.name}</span>
              <BackButton />
            </h3>
          </Col>
          <Col xs={6}>
            This Site currently includes <b>{commuters.length}</b> commuters. To view individual names and address of current commuters, expand the preview panel to the right. To add new commuters, use the "Upload" button below.
          </Col>
          <Col xs={6}>
            <Accordion>
              <Panel
                bsStyle='info'
                eventKey='1'
                header={`${commuters.length} Existing Commuters`}
                >
                <CommuterTable
                  commuters={commuters}
                  />
              </Panel>
            </Accordion>
          </Col>
          <Col xs={12}>
            <Panel
              className='upload-file-panel'
              header={(<h3>Upload a File</h3>)}
              >
              <Row>
                <Col xs={6}>
                  <Panel className='file-upload'>
                    <div className='form-group'>
                      <p>Add commuters by uploading a CSV-format spreadsheet.</p>
                      <input
                        accept='text/csv'
                        id='commuters-file'
                        onChange={this._onSelectFile}
                        type='file'
                        />
                    </div>
                  </Panel>
                  {newCommutersUploaded &&
                    <div>
                      <p>
                        This file includes {newCommuters.length} commuters records and is ready to be processed.
                        To preview the commuters, expand the preview panel to the left.
                        <b>To add the commuters to this site, click the "Add Commuters to Site" button below.</b>
                      </p>
                      <div className='success-button-container'>
                        <Button
                          bsSize='large'
                          bsStyle='success'
                          onClick={this._handleSubmit}
                          >
                          Add Commuters to Site
                        </Button>
                      </div>
                    </div>
                  }
                </Col>
                <Col xs={6}>
                  <Accordion>
                    {newCommutersUploaded &&
                      <Panel
                        header={`${newCommuters.length} New Commuters`}
                        bsStyle='success'
                        eventKey='2'
                        >
                        <CommuterTable
                          commuters={newCommuters}
                          />
                      </Panel>
                    }
                  </Accordion>
                </Col>
              </Row>
            </Panel>
          </Col>
        </Row>
        {this.state.loading &&
          <Modal>
            <p>Saving commuters, please wait...</p>
          </Modal>
        }
      </Grid>
    )
  }
}

function CommuterTable ({commuters}) {
  return (
    <BootstrapTable
      data={commuters}
      pagination={commuters.length > 10}
      >
      <TableHeaderColumn dataField='_id' isKey hidden />
      <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='address'>Address</TableHeaderColumn>
    </BootstrapTable>
  )
}
