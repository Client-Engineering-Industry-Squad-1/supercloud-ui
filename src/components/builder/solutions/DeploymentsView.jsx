import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Grid,Row,Column,Tile,OverflowMenu,OverflowMenuItem } from "carbon-components-react";
import './_DeploymentView.scss';
import DeploymentDetailsView from './DeploymentDetailsView';

class DeploymentsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deployments: [],
      loading: true,
    };
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  async loadDeployments() {
    const response = await fetch(`/api/deployment`);
    const data = await response.json();
    this.setState({ deployments: data, loading: false });
  }

  componentDidMount() {
    this.loadDeployments();
  }

  handleEditClick() {
    this.setState({ isModalOpen: true });
  }

  render() {
    const { deployments, loading } = this.state;
    if (loading) {
      return (
        <div/>
      );
    }

    return (
        <Grid className="deployments">
          <Row className="dep-page__row">
            <Column>
              <h2>My Deployments</h2>
            </Column>
          </Row>
          <Row className="d-tile-group">
            {deployments.map((deployment) => (
              <Column lg={{ span: 4 }} key={deployment.id}>
                <Tile>
                  <div className="d-tile-header">
                    <Link to={`/deployments/${deployment.id}`}>
                      <h5 className="deployment-name">{deployment.name}</h5>
                    </Link>

                    <OverflowMenu>
                      <OverflowMenuItem itemText="Edit" onClick={() => console.log('Edit deployment')} />
                      <OverflowMenuItem itemText="Delete" onClick={() => this.handleEditClick(deployment.id)} />
                    </OverflowMenu>
                  </div>
                  <div className="d-tile-desc">{deployment.state}</div>
                </Tile>
              </Column>
            ))}
          </Row>
        </Grid>
      );
    }
  }
  
  export default DeploymentsView;