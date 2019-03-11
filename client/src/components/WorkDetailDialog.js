import React, { Component } from "react";
import '../App.css';
import { withTheme } from '@material-ui/core/styles';
import { Grid, Typography, Dialog, DialogTitle, Chip, Button, DialogActions, Link} from "@material-ui/core";
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import 'typeface-roboto';

class WorkDetailDialog extends Component {
    constructor(props) {
        super(props);
    }

    isBountyCreator = () => {
        const { accounts, bounty } = this.props;

        if (accounts[0] == bounty.creator) return true;
        else return false;
    }

    ipfsLink = () => {
        return `https://ipfs.io/ipfs/${this.props.work.workFileHash}`
    }

    render() {
        return(
            <div>
                {this.props.work && (
                    <Dialog
                        open={this.props.open}
                        onClose={this.props.handleClose}
                        fullWidth={true}
                        maxWidth="md"
                        aria-labelledby="form-dialog-title"
                        >
                        <DialogTitle id="form-dialog-title">Work proposed for Bounty #{this.props.bounty.id}</DialogTitle>
                        <div style={{margin: 20}}>
                            <div style={{marginBottom: 20}}>
                                <Grid container alignItems="flex-start" direction="column">
                                    <Grid item>
                                        <Typography variant="overline"><b>Description</b></Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1">{this.props.work.description}</Typography>
                                    </Grid>
                                </Grid>
                            </div>
                            <div style={{marginBottom: 20}}>
                                <Grid container alignItems="flex-start" direction="column">
                                    <Grid item>
                                        <Typography variant="overline"><b>File</b></Typography>
                                    </Grid>
                                    <Grid item>
                                        <Link href={this.ipfsLink()} variant="body1" target="_blank" rel="noopener noreferrer">{this.props.work.workFileHash}</Link>
                                    </Grid>
                                </Grid>
                            </div>
                            <div>
                                <Grid container alignItems="flex-start" direction="column">
                                    <Grid item>
                                        <Typography variant="overline"><b>Doer</b></Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1">{this.props.work.doer}</Typography>
                                    </Grid>
                                </Grid>
                            </div>
                            {this.props.work.approved && (
                                <div>
                                    <Chip label="Approved" style={{marginTop: 20, backgroundColor: green[500], color: "#FFFFFF"}}/>
                                </div>
                            )}
                            {this.props.work.isDenied && (
                                <div>
                                    <Chip label="Rejected" style={{marginTop: 20, backgroundColor: red[500], color: "#FFFFFF"}}/>
                                </div>
                            )}
                            
                        </div>
                        <DialogActions>
                            <Button onClick={this.props.handleClose} color="primary">
                                Ok
                            </Button>
                            {this.isBountyCreator() && this.props.bounty.isOpened && (
                                <Button onClick={this.props.handleReject.bind(this, this.props.work)} color="secondary">
                                    Reject
                                </Button>
                            )}
                            {this.isBountyCreator() && this.props.bounty.isOpened && (
                                <Button color="primary" onClick={this.props.handleApprove.bind(this, this.props.work)}>
                                    Approve
                                </Button>
                            )}
                        </DialogActions>
                    </Dialog>
                )}
                 
            </div>
        );
    }
}

export default withTheme()(WorkDetailDialog);

