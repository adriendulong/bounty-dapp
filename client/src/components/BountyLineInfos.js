import React, { Component } from "react";
import '../App.css';
import { Typography } from "@material-ui/core";
import 'typeface-roboto';

class BountyLineInfos extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <Typography variant="p">
                    {this.props.title}
                </Typography>
            </div>
        );
    }
}

export default BountyLineInfos;

