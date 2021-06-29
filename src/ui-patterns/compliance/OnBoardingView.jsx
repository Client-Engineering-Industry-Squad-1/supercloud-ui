import React, { Component } from "react";

import {
    ProgressIndicator,
    ProgressStep,
    ClickableTile,
    Button
} from 'carbon-components-react';

import ControlDetailsPane from './ControlDetailsPane';

import Draggable from 'react-draggable';

const mockControls = [
    {
        id: "AC-14"
    },
    {
        id: "AC-17 (9)"
    },
    {
        id: "AC-19 (5)"
    },
    {
        id: "AC-20"
    },
    {
        id: "AC-21"
    },
    {
        id: "AC-5"
    },
    {
        id: "AC-6"
    },
]

function createSVG() {
    var svg = document.getElementById("svg-canvas");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", 
                                     "svg");
      svg.setAttribute('id', 'svg-canvas');
      svg.setAttribute('style', 'position:absolute;top:0px;left:0px');
      svg.setAttribute('width', document.body.clientWidth);
      svg.setAttribute('height', document.body.clientHeight);
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", 
                         "xmlns:xlink", 
                         "http://www.w3.org/1999/xlink");
      document.body.appendChild(svg);
    }
    return svg;
}

  function drawCircle(x, y, radius, color) {
    var svg = createSVG();
	    var shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    shape.setAttributeNS(null, "cx", x);
    shape.setAttributeNS(null, "cy", y);
    shape.setAttributeNS(null, "r",  radius);
    shape.setAttributeNS(null, "fill", color);
    svg.appendChild(shape);
}

function drawCurvedLine(x1, y1, x2, y2, color, tension) {
    var svg = createSVG();
    var shape = document.createElementNS("http://www.w3.org/2000/svg", 
                                         "path");
    var delta = (x2-x1)*tension;
    var hx1=x1+delta;
    var hy1=y1;
    var hx2=x2-delta;
    var hy2=y2;
    var path = "M "  + x1 + " " + y1 + 
               " C " + hx1 + " " + hy1 
                     + " "  + hx2 + " " + hy2 
               + " " + x2 + " " + y2;
    shape.setAttributeNS(null, "d", path);
    shape.setAttributeNS(null, "fill", "none");
    shape.setAttributeNS(null, "stroke", color);
    svg.appendChild(shape);
}

function findAbsolutePosition(htmlElement) {
    var x = htmlElement.offsetLeft;
    var y = htmlElement.offsetTop;
    console.log(x, y)
    for (var x=0, y=0, el=htmlElement; 
         el != null; 
         el = el.offsetParent) {
           x += el.offsetLeft;
           y += el.offsetTop;
    }
    return {
        "x": x,
        "y": y
    };
  }

  function connectDivs(leftId, rightId, color, tension) {
    var svg = document.getElementById("svg-canvas");
    if (svg) document.body.removeChild(svg);
    var left = document.getElementById(leftId);
    var right = document.getElementById(rightId);
      
    var leftPos = findAbsolutePosition(left);
    var x1 = leftPos.x;
    var y1 = leftPos.y;
    x1 += left.offsetWidth;
    y1 += (left.offsetHeight / 2);
  
    var rightPos = findAbsolutePosition(right);
    var x2 = rightPos.x;
    var y2 = rightPos.y;
    y2 += (right.offsetHeight / 2);
  
    var width=x2-x1;
    var height = y2-y1;
  
    drawCircle(x1, y1, 3, color);
    drawCircle(x2, y2, 3, color);
    drawCurvedLine(x1, y1, x2, y2, color, tension);
  }

class OnBoardingView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined,
            isPaneOpen: false,
            dataDetails: false,
            data: [],
            curControls: mockControls
        };
        this.connectControls = this.connectControls.bind(this);
        this.openPane = this.openPane.bind(this);
        this.hidePane = this.hidePane.bind(this);
    }

    async componentDidMount() {
        fetch('/userDetails')
            .then(res => res.json())
            .then(async user => {
                const jsonData = await this.props.controls.getControls();
                this.setState({
                    user: user || undefined,
                    data: jsonData
                });
            });
        this.connectControls();
        window.addEventListener('resize', this.connectControls);
    }

    connectControls() {
        const color = '#456';
        const tension = 0;
        var svg = document.getElementById("svg-canvas");
        if (svg) document.body.removeChild(svg);

        for (let index = 1; index < this.state.curControls.length; index++) {
            const left = document.getElementById(`control-tile-${this.state.curControls[index-1].id.toLowerCase().replaceAll(' ', '-').replace(/[() ]/gi, '')}`);
            const right = document.getElementById(`control-tile-${this.state.curControls[index].id.toLowerCase().replaceAll(' ', '-').replace(/[() ]/gi, '')}`);
            const leftPos = findAbsolutePosition(left);
            var x1 = leftPos.x;
            var y1 = leftPos.y;
            x1 += left.offsetWidth;
            y1 += (left.offsetHeight / 2);
            
            const rightPos = findAbsolutePosition(right);
            var x2 = rightPos.x;
            var y2 = rightPos.y;
            y2 += (right.offsetHeight / 2);
            
            drawCircle(x1, y1, 3, color);
            drawCircle(x2, y2, 3, color);
            drawCurvedLine(x1, y1, x2, y2, color, tension);
        }
    }

    openPane = async (controlId) => {
        if (controlId) {
            let filter = {
                include: ['nist', 'services', 'architectures']
            }
            if (this.state.user?.roles?.includes("fs-viewer")) filter = {
                include: ['controlDetails', 'nist', 'services', 'architectures']
            }
            this.setState({
                isPaneOpen: true,
                dataDetails: false
            });
            this.props.controls.getControlsDetails(controlId, filter).then((controlData) => {
                if (controlData?.controlDetails?.description) controlData.controlDetails.description = controlData.controlDetails.description.replaceAll(/\n\n([a-z]\))/gi, '\n\n**$1**');
                if (controlData?.controlDetails?.implementation) controlData.controlDetails.implementation = controlData.controlDetails.implementation.replaceAll('\n\n#### Part', '\n\n&nbsp;  \n#### Part');
                if (controlData?.controlDetails?.implementation) controlData.controlDetails.implementation = controlData.controlDetails.implementation.replaceAll('\n\n#####', '\n\n&nbsp;  \n#####');
                this.setState({
                    dataDetails: controlData
                });
            });
        }
    };

    hidePane = () => {
        this.setState({
            isPaneOpen: false
        });
    };

    render() {
        return (
            <div className="bx--grid">
                <div className="bx--row">
                    <br></br>
                    <h2>
                        Controls On Boarding
                    </h2>
                </div>
                <div className="bx--row"  style={{marginTop: '1rem', marginBottom: '3rem'}}>
                    <ProgressIndicator
                        // vertical
                        // currentIndex={number('Current progress (currentIndex)', 1)}
                        spaceEqually>
                        <ProgressStep
                            label="Setup"
                            description="Step 1: Getting started with Carbon Design System"
                            secondaryLabel="Optional label"
                            />
                        <ProgressStep
                            label="Weekly"
                            description="Step 2: Getting started with Carbon Design System"
                            secondaryLabel="Optional label"
                            />
                        <ProgressStep
                            label="Monthly"
                            description="Step 3: Getting started with Carbon Design System"
                            secondaryLabel="Optional label"
                            />
                        <ProgressStep
                            label="Quarterly"
                            description="Step 4: Getting started with Carbon Design System"
                            secondaryLabel="Optional label"
                            />
                        <ProgressStep
                            label="Annual"
                            description="Step 5: Getting started with Carbon Design System"
                            secondaryLabel="Optional label"
                            />
                    </ProgressIndicator>
                </div>
                <div className="bx--row">
                    {/* <Draggable>
                        <ClickableTile id='control-ac-2'>
                            AC-2
                        </ClickableTile>
                    </Draggable>
                    <Draggable handle=".handle">
                        <div><ClickableTile id='control-ac-3' handleClick={() => {
                            this.openPane("SC-12");
                        }}>
                            SC-12
                        </ClickableTile>
                        <div  className="handle"> DRAG</div></div>
                    </Draggable> */}

                    {this.state.curControls && this.state.curControls.map((control) => (
                         <ClickableTile 
                            id={`control-tile-${control.id.toLowerCase().replaceAll(' ', '-').replace(/[() ]/gi, '')}`}
                            style={{marginLeft: '2rem'}}
                            handleClick={() => this.openPane(control.id)}>
                            {control.id}
                        </ClickableTile>
                    ))}
                </div>
                
                <div>
                    <ControlDetailsPane 
                        data={this.state.dataDetails}
                        open={this.state.isPaneOpen}
                        onRequestClose={this.hidePane}/>
                </div>
            </div >
        );
    }
}
export default OnBoardingView;