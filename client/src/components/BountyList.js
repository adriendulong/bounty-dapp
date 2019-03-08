import React, { Component } from "react";
import '../App.css';
import { Typography, List, ListItem, ListItemText, ListSubheader } from "@material-ui/core";
import 'typeface-roboto';

class BountyList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if(!this.props.bounties) {
            return (
                <div>
                    <Typography variant="h4">
                        No Bounties
                    </Typography>
                </div>
            )
        }
        else {
            return(
                <div>
                    <div>
                        <Typography variant="h4">
                            {this.props.title}
                        </Typography>
                    </div>
                    <div style={{marginTop: 20}}>
                        <List>
                            {this.props.bounties.map(bounty => (
                                <ListItem button key={bounty.id} onClick={this.props.selectBounty.bind(this, bounty)}>
                                    <ListItemText 
                                        primary={bounty.title}
                                        secondary={bounty.description}
                                    />
                                    <ListSubheader>
                                        Creator: {bounty.creator}
                                    </ListSubheader>
                                </ListItem>
                            ))}
                        </List>
                    </div>
                </div>
            );
        } 
    }
}

export default BountyList;

