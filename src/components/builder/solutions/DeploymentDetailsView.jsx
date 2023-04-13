import React, { Component } from "react";
import { Grid, Row, Column, Button, Form, Modal, ModalBody, TextInput } from "carbon-components-react";
import Swal from 'sweetalert2';
import './_DeploymentDetailsView.scss';

class DeploymentDetailsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deployment: null,
      loading: true,
      isModalOpen: false,
      variables:[],
      buttonsDisabled: false
    };
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleDeployButtonClick = this.handleDeployButtonClick.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSaveDraft = this.handleSaveDraft.bind(this);
    this.handleVariableChange = this.handleVariableChange.bind(this);
  }

  async loadDeployment() {
    const deploymentId = this.getDeploymentIdFromUrl();
    const response = await fetch(`/api/deployment/${deploymentId}`);
    const data = await response.json();
    this.setState({ deployment: data, loading: false });
  }

  async componentDidMount() {
    await this.loadDeployment();
  }

  getDeploymentIdFromUrl() {
    const urlParts = window.location.pathname.split("/");
    const deploymentId = urlParts[urlParts.length - 1];
    return deploymentId;
  }
  
  handleEditButtonClick() {
    this.setState({
      isModalOpen: true,
      variables: this.state.deployment.variables.slice(),
    });
  }

  handleDeployButtonClick() {
    const deploymentId = this.getDeploymentIdFromUrl();
    Swal.fire({
      title: 'Deploying...',
      html: 'Please wait while the deployment is being processed.',
      allowOutsideClick: false,
      confirmButtonColor: '#000000',
      didOpen: () => {
        Swal.showLoading();
      }
    });
    fetch(`/api/deployment/${deploymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        state: 'Deployed'
      })
    })
    .then(response => response.json())
    .then(data => {
      this.setState({ deployment: data, isModalOpen: false, buttonsDisabled: true }); 
      Swal.fire({
        confirmButtonColor: '#000000',
        icon: 'success',
        title: 'Deployment Successful!',
        text: 'The deployment was successfully processed.'
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  handleCloseModal() {
    this.setState({ isModalOpen: false });
  }

  handleSaveDraft() {
    const deploymentId = this.getDeploymentIdFromUrl();
    const variables = this.state.variables.map(variable => ({name: variable.name, value: variable.value}));
    console.log(variables);
    fetch(`/api/deployment/${deploymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        variables: this.state.variables.map((variable) => ({
          name: variable.name,
          value: variable.value,
        })),
      }),
    })
    .then(response => response.json())
    .then(data => {
      this.setState({ deployment: data, isModalOpen: false });
      Swal.fire({
        confirmButtonColor: '#000000',
        icon: 'success',
        title: 'Draft Saved!',
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  handleVariableChange(index, value) {
    const variables = this.state.variables.slice();
    variables[index] = {...variables[index], value};
    this.setState({ variables });
  }

  render() {
    const { deployment, loading, isModalOpen } = this.state;
    const deploymentId = this.getDeploymentIdFromUrl();

    let buttonsDisabled = false;
    if (deployment && deployment.state === "Deployed") {
      buttonsDisabled = true;
    }
    if (loading) {
      return (
        <div/>
      );
    }
  
    return (
      <Grid className="deployment-details">
        <Row className="dep-details__row">
          <Column>
            <a className="header-link" href="/deployments">Deployments</a> /{" "}
            <a className="header-link" href={`/deployments/${deploymentId}`}>{deployment.name}</a>{" /"}
          </Column>
        </Row>
        <Row className= "deployment-name-header">
          <Column>
            <h2>{deployment.name}</h2>
          </Column>
          <Column className="edit-deploy-buttons">
            {!buttonsDisabled && (
              <>
                <Button className="edit-draft-button" onClick={this.handleEditButtonClick}>
                  Edit
                </Button>
                <Button className="deploy-draft-button" onClick={this.handleDeployButtonClick}>
                  Deploy
                </Button>
              </>
            )}
          </Column>
        </Row>
        <Row className="deployment-state-row">
          <Column>
            <h3>State</h3>
            <div className="deployment-state">{deployment.state}</div>
          </Column>
        </Row>
        <Row className="deployment-variables-row">
          <Column>
            <h3>Variables</h3>
            {deployment.variables.map((variable, index) => (
              <div key={variable.name} className="deployment-variable">
                <p className="deployment-variable-label">{variable.name}:</p>
                <p className="deployment-variable-value">{variable.value}</p>
              </div>
            ))}
          </Column>
        </Row>
        <Modal
          open={isModalOpen}
          onRequestClose={this.handleCloseModal}
          modalHeading="Edit Deployment"
          primaryButtonText="Save Draft"
          secondaryButtonText="Cancel"
        >
          <ModalBody>
            <Form>
              {this.state.variables.map((variable, index) => (
                <TextInput
                  id={`var-${variable.name}`}
                  key={variable.name}
                  labelText={variable.name}
                  value={variable.value}
                  onChange={(event) => this.handleVariableChange(index, event.target.value)}
                />
              ))}
            </Form>
          </ModalBody>
          <div className="bx--modal-footer">
            <Button kind="secondary" onClick={this.handleCloseModal}>
              Cancel
            </Button>
            <Button kind="primary" onClick={this.handleSaveDraft}>
              Save Draft
            </Button>
          </div>
        </Modal>
      </Grid>
    );
  }  
}

export default DeploymentDetailsView;