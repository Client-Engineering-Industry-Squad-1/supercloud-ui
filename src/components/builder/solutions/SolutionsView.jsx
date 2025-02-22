import React, { Component } from "react";

import {
    Link, Navigate,
} from "react-router-dom";

import {
    Button, Tile, OverflowMenu, OverflowMenuItem,
    Grid, Row, Column
} from 'carbon-components-react';
import {
    Add16, Close32
} from '@carbon/icons-react';
import SlidingPane from "react-sliding-pane";

import ReactGA from 'react-ga4';

import ValidateModal from '../../ValidateModal';
import SolutionModal from "./SolutionModal";


class SolutionsView extends Component {

    // Configure the App
    constructor(props) {
        super(props);

        this.state = {
            solutions: [],
            showForm: false,
            user: {},
        };
        this.deleteSolution = this.deleteSolution.bind(this);
    }

    async loadSolutions() {
        this.setState({ dataLoaded: false });
        const uri = this.props.isUser ? `/api/users/${encodeURIComponent(this.props?.user?.email)}/solutions` : '/api/solutions';
        fetch(uri)
            .then(res => res.json())
            .then(solutions => {
                if (!solutions.error) this.setState({
                    solutions: solutions.filter(sol => {
                        const solId = sol.id?.toLowerCase();
                        const solName = sol.name?.toLowerCase();
                        const solDesc = sol.short_desc?.toLowerCase();
                        const provider = sol.platform ?? sol.provider ?? '';
                        const restrictedProviders = [];
                        if (!this.state.user?.config?.ibmContent) {
                            if (solId?.includes('ibm') || solName.includes('ibm')) return false;
                            restrictedProviders.push('ibm');
                            restrictedProviders.push('ibm-cp');
                        }
                        if (!this.state.user?.config?.azureContent) {
                            if (solId?.includes('azure') || solName.includes('azure') || solDesc.includes('azure')) return false;
                            restrictedProviders.push('azure');
                        }
                        if (!this.state.user?.config?.awsContent) {
                            if (solId?.includes('aws') || solName.includes('aws') || solDesc.includes('aws')) return false;
                            restrictedProviders.push('aws');
                        }
                        return !restrictedProviders.includes(provider);
                    }), dataLoaded: true
                });
            })
            .catch(console.error);
    }

    componentDidMount() {
        ReactGA.send({ hitType: "pageview", page: window.location.pathname });
        this.setState({ user: this.props.user });
        this.loadSolutions();
    };

    componentDidUpdate() {
        if (this.props.user?.config !== this.state.user?.config) {
            this.setState({ user: this.props.user });
            this.loadSolutions();
        }
        if (this.props.isUser !== this.state.isUser) {
            this.setState({ isUser: this.props.isUser });
            this.loadSolutions();
        }
    };

    downloadTerraform(solution) {

        if (!solution) {
            this.props.addNotification("error", "Error", "Cannot download Automation at this time.");
            return
        }

        this.props.addNotification("info", "BUILDING", "Building automation...");
        fetch(`/api/solutions/${solution.id}/automation`)
            .then(response => {
                if (response && response.status === 200) {
                    response.blob().then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = `${solution.name?.toLowerCase()?.replace(/[ /\\_?;.=:,+]/g, '-')}-automation.zip`;
                        a.click();
                    });
                }
                else {
                    this.props.addNotification("error", response.status + " " + response.statusText, "Error building your automation module.");
                }
            });
    }

    deleteSolution() {
        if (this.state.curSol) {
            this.props.addNotification('info', 'Deleting', `Solution ${this.state.curSol.id} id being deleted...`);
            fetch(`/api/solutions/${this.state.curSol.id}`, { method: 'delete' })
                .then(res => {
                    console.log(res);
                    if (res.error) return this.props.addNotification("error", res?.status === 401 ? "Unauthorized" : "Error", res.error.message);
                    this.props.addNotification('success', 'OK', `Solution ${this.state.curSol.id} deleted successfully!`);
                    this.setState({
                        showValidate: false,
                        curSol: undefined
                    });
                    this.loadSolutions();
                })
                .catch((err) => {
                    this.props.addNotification('error', 'Error', `Error while deleting solution ${this.state.curSol.id}, check the logs for details.`);
                    console.log(err);
                });
        }
    }

    render() {

        return (

            <Grid className="solutions">
                <Row className="sol-page__row">
                    <Column lg={{ span: 12 }}>
                        <h2>
                            {`${this.props.isUser ? 'Solution Builder' : 'Super Cloud Market Place'}`}
                            {this.state.user?.roles?.includes("editor") ? <div className="create-buttons"><Button
                                size="sm"
                                onClick={() => this.setState({ nav: '/solutions/new' })}
                                renderIcon={Add16} >
                                Create Solution
                            </Button><OverflowMenu flipped light>
                                    <OverflowMenuItem
                                        itemText="Create (Manual)"
                                        onClick={() => this.setState({ showForm: true })} />
                                </OverflowMenu></div> : <></>}
                        </h2>
                        <br></br>
                    </Column>
                </Row>
                {this.props.isUser ? <h3 className="custom-sol-header" >Created Solutions</h3> : null}

                <div className="tile-group">
                    {this.state.solutions.map((solution) => (
                        <Tile
                            key={solution.id}
                            value={solution.id}
                            name={solution.id}>
                            <div className="tile-header">
                                <Link to={`/solutions/${solution.id}`} className="tile-title">
                                    <h5>{solution.name}</h5>
                                </Link>

                                <OverflowMenu flipped light>
                                    <OverflowMenuItem
                                        itemText="Download"
                                        onClick={() => this.downloadTerraform(solution)} />
                                    {this.state.user?.role === "admin" || (this.state.user?.roles?.includes('editor') && this.props.isUser) ?
                                        <OverflowMenuItem hasDivider isDelete itemText="Delete" onClick={() => {
                                            this.setState({
                                                showValidate: true,
                                                curSol: solution
                                            });
                                        }} /> : <></>}
                                    <OverflowMenuItem itemText="Publish" />
                                </OverflowMenu>
                            </div>
                            {/* <h6>{solution.id}</h6> */}
                            <div className="tile-desc">{solution.short_desc}</div>
                        </Tile>
                    ))
                    }</div>

                <SlidingPane
                    closeIcon={<Close32 />}
                    title="Add a Solution"
                    className="sliding-pane"
                    isOpen={this.state.showForm}
                    width="600px"
                    onRequestClose={() => this.setState({ showForm: false })}
                >
                    <SolutionModal
                        show={this.state.showForm}
                        handleClose={() => this.setState({ showForm: false })}
                        isUpdate={this.state.updateModal}
                        data={this.state.dataDetails}
                        toast={this.props.addNotification}
                        isDuplicate={this.state.isDuplicate}
                        user={this.state.user}
                    />
                </SlidingPane>

                {this.state.nav ? <Navigate to={this.state.nav} /> : <></>}

                {this.state.showValidate && this.state.curSol &&
                    <ValidateModal
                        danger
                        submitText="Delete"
                        heading="Delete Solution"
                        message={`You are about to remove solution "${this.state.curSol.name ?? this.state.curSol.id}". This action cannot be undone. This will remove the solution record, as well as all associated files. If you are sure, type "${this.state.curSol.id}" and click Delete to confirm deletion.`}
                        show={this.state.showValidate}
                        inputRequired={this.state.curSol.id}
                        onClose={() => {
                            this.setState({
                                showValidate: false,
                                curSol: undefined
                            });
                        }}
                        onRequestSubmit={this.deleteSolution}
                        onSecondarySubmit={() => {
                            this.setState({
                                showValidate: false,
                                curSol: undefined
                            });
                        }} />
                }

            </Grid>

        );
    }
}

export default SolutionsView;
