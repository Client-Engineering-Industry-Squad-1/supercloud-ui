import React, { Component } from "react";
import { Link } from "react-router-dom";
import {Grid,Row,Column,Tile,OverflowMenu,OverflowMenuItem} from "carbon-components-react";
import './_DeploymentView.scss';

class DeploymentsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deployments: [],
      loading: true,
    };
  }

  async loadDeployments() {
    const response = await fetch(`/api/deployment`);
    const data = await response.json();
    console.log([data]);
    this.setState({ deployments: data, loading: false });
  }

  componentDidMount() {
    this.loadDeployments();
  }

  render() {
    const { deployments, loading } = this.state;

    if (loading) {
      return <div>Loading...</div>;
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
                      <h5>{deployment.name}</h5>
                    </Link>

                    <OverflowMenu>
                      <OverflowMenuItem itemText="Edit" onClick={() => console.log('Edit deployment')} />
                      <OverflowMenuItem itemText="Delete" onClick={() => console.log('Delete deployment')} />
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