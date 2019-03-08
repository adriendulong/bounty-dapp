import React, { Component } from "react";
import '../App.css';
import WorkProposedList from './WorkProposedList'
import WorkDetailDialog from './WorkDetailDialog';
import { Typography, Grid, Divider, Button, Dialog, AppBar, Toolbar, IconButton, Slide, TextField, Chip } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import { withTheme } from '@material-ui/core/styles';
import 'typeface-roboto';

function Transition(props) {
    return (<Slide direction="up" {...props}/>);
}

class BountyPage extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            open: false,
            workDescription: "",
            workIds: null,
            works: null,
            openDetailWork: false,
            workOpened: null,
            isOpened: this.props.bounty.isOpened
        }
        this.retrieveWorks();
    }

    componentDidMount = async () => {
        
    }

    proposeWork = () => {
        this.setState({
            open: true
        });
    }

    handleClose = () => {
        this.setState({
            open: false
        });
    }

    handlePropose = () => {
        console.log(this.state.workDescription);
        this.setState({
            open: false
        });
        this.createWork(this.state.workDescription, this.props.bounty.id);
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    /**
     * Create a new work for this bounty
     */
    createWork = async (description, id) => {
        const { accounts, contract } = this.props;

        await contract.methods.submitWork(description, id).send({ from: accounts[0]});
        await this.retrieveWorks();
    }

    /**
     * Retrieve the works that has be proposed for this bounty
     */
    retrieveWorks = async () => {
        const { contract } = this.props;

        let workIds = await contract.methods.getWorkProposedIds(this.props.bounty.id).call();
        console.log(workIds);

        // Get all the bounties infos
        var works = await Promise.all(workIds.map(async (id) => {
            const work = contract.methods.getWorkInfos(parseInt(id)).call();
            return work;
        }));
        console.log(works);

        // Update the state with the workIds list and the works list
        this.setState({
            workIds,
            works
        })
    }

    handleCloseWork = () => {
        console.log("Close detail work");
        this.setState({
            openDetailWork: false,
            workOpened: null
        });
    }

    openWork = (work) => {
        this.setState({
            openDetailWork: true,
            workOpened: work
        });
    }

    approveWork = async (work) => {
        this.handleCloseWork();
        
        const { accounts, contract } = this.props;
        try {
            await contract.methods.approveWork(this.props.bounty.id, work.id).send({from: accounts[0]});
            this.setState({isOpened: false});
            await this.retrieveWorks();
        }
        catch (e) {
            console.error(e);
        }
        
    }

    rejectWork = async (work) => {
        this.handleCloseWork();
        
        const { accounts, contract } = this.props;
        await contract.methods.rejectWork(this.props.bounty.id, work.id).send({from: accounts[0]});
        await this.retrieveWorks();
    }

    render() {
        return(
            <div style={{marginTop: 20, marginLeft: 20, marginRight: 20}}>
                <div style={{marginBottom: 40}}>
                    <Grid container>
                        <Grid item>
                            <Button onClick={this.props.quitBounty} color="secondary">
                                Get back to bounties list
                            </Button>
                        </Grid>
                    </Grid>
                </div>
                <div className="title" style={{marginBottom: 20}}>
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h2" align="left" style={{color: this.props.theme.palette.primary.main}}>
                                {this.props.bounty.title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" align="right" style={{color: this.props.theme.palette.secondary.main}}>
                                {this.props.web3.utils.fromWei(this.props.bounty.amount)} ETH
                            </Typography>
                        </Grid>
                    </Grid>
                    
                </div>
                <div className="creator" style={{marginBottom: 5}}>
                    <Grid container>
                        <Grid item>
                            <Typography variant="body1">
                                <b>Creator:</b> {this.props.bounty.creator}
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
                <div className="description" style={{marginBottom: 20}}>
                    <Grid container>
                        <Grid item>
                            <Typography variant="body1">
                                <b>Description:</b> {this.props.bounty.description}
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
                {this.state.isOpened && (
                    <div className="createWork" style={{marginBottom: 20}}>
                        <Grid container>
                            <Grid item>
                                <Button variant="contained" color="secondary" onClick={this.proposeWork}>
                                    Propose a work
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                )}
                {!this.state.isOpened && (
                    <div style={{marginBottom: 20}}>
                        <Grid container>
                            <Grid item>
                                <Chip label="Closed" color="secondary"/>
                            </Grid>
                        </Grid>
                    </div> 
                )}
                <Divider variant="middle" light={true}/>
                {this.state.workIds && (
                    <div className="worksSubmitted" style={{marginTop: 60}}>
                        <div>
                            <Typography variant="h2">
                                Works Proposed
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="overline">
                                {this.state.workIds.length} works submitted for this bounty
                            </Typography>
                        </div>
                        <div>
                            <WorkProposedList bounty={this.props.bounty} contract={this.props.contract} works={this.state.works} openWork={this.openWork}/>
                        </div>
                    </div>
                )}
                {!this.state.workIds && (
                    <div className="worksSubmitted" style={{marginTop: 20}}>
                        <Grid container>
                            <Grid item>
                                <Typography variant="h6">
                                    No work submitted for this bounty
                                </Typography>
                            </Grid>
                        </Grid>
                    </div>
                )}
                <div>
                    <Dialog
                        fullScreen
                        open={this.state.open}
                        onClose={this.handleClose}
                        TransitionComponent={Transition}
                        >
                        <AppBar style={{position: 'relative'}}>
                            <Toolbar>
                                <IconButton color="inherit" onClick={this.handleClose} aria-label="Propose a new work">
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" color="inherit" style={{flex: 1}}>
                                    Propose a new work
                                </Typography>
                                <Button color="inherit" onClick={this.handlePropose}>
                                    Propose
                                </Button>
                            </Toolbar>
                        </AppBar>
                        <div style={{padding: 20}}>
                            <TextField
                                id="input-description"
                                label="Work Description"
                                multiline
                                rowsMax="10"
                                value={this.state.workDescription}
                                onChange={this.handleChange('workDescription')}
                                variant="outlined"
                                fullWidth
                            />
                        </div>
                    </Dialog>
                    <WorkDetailDialog 
                        accounts = {this.props.accounts}
                        open={this.state.openDetailWork} 
                        handleClose={this.handleCloseWork} 
                        work={this.state.workOpened} 
                        bounty={this.props.bounty} 
                        handleReject={this.rejectWork}
                        handleApprove={this.approveWork}/>
                </div>
            </div>
        );
    }
}


export default withTheme()(BountyPage);

