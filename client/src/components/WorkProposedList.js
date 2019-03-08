import React, { Component } from "react";
import '../App.css';
import { withTheme } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, ListSubheader, ListItemIcon } from "@material-ui/core";
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import 'typeface-roboto';

class WorkProposedList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div style={{marginTop: 40}}>
                <List>
                    {this.props.works.map(work => (
                        <ListItem key={work.id} divider button onClick={this.props.openWork.bind(this, work)}>
                            {work.approved && (
                                <ListItemIcon>
                                    <DoneIcon color="primary"/>
                                </ListItemIcon>
                            )}
                            {work.isDenied && (
                                <ListItemIcon>
                                    <CloseIcon color="secondary"/>
                                </ListItemIcon>
                            )}
                            <ListItemText 
                                primary={work.description}
                            />
                            <ListSubheader>
                                Creator: {work.doer}
                            </ListSubheader>
                        </ListItem>
                    ))}
                </List>
            </div>
        );
    }
}

export default withTheme()(WorkProposedList);

