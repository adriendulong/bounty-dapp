import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {Grid, Typography, Button, Divider, Snackbar} from '@material-ui/core';
import 'typeface-roboto';
import BountyList from "./BountyList";
import WorkProposedList from "./WorkProposedList";

const styles = {
    root: {
      margin: 10,
    },
    marginBig: {
        marginTop: 80,
        marginBottom: 40
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
};

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: 0,
            bounties: [],
            works: [],
            snackOpen: false
        }
    }

    componentDidMount = async () => {
        this.props.contract.events.BalanceWithdrawed({withdrawer: this.props.accounts[0]}, this.withdrawCallback);
        await this.loadBalance();
        await this.loadBounties();
        await this.loadWorks();
    }

    withdrawCallback = () => {
        this.setState({
            snackOpen: false
        });
        this.loadBalance();
    }

    loadBalance = async () => {
        const { contract, web3 } = this.props;
        let balance = await contract.methods.pendingWithdrawals(this.props.accounts[0]).call();
        this.setState({
            balance: web3.utils.fromWei(balance)
        })
    }

    loadBounties = async () => {
        const { contract } = this.props;
        let countBounties = await contract.methods.createdBountyCount(this.props.accounts[0]).call();
        //let ids = await contract.methods.creatorToBountyIds(this.props.accounts[0], 0).call();
        console.log(countBounties);
        let bounties = [];
        if(parseInt(countBounties) > 0) {
            for(let i = 0; i < parseInt(countBounties); i++){
                let id = await contract.methods.creatorToBountyIds(this.props.accounts[0], i).call();
                let bounty = await contract.methods.getBountyInfos(id).call();
                bounties.push(bounty);
            }
        }
        

        console.log(bounties);
        this.setState({
            bounties
        });
    }

    loadWorks = async () => {
        const { contract } = this.props;
        let countWorks = await contract.methods.worksProposedCount(this.props.accounts[0]).call();
        //let ids = await contract.methods.creatorToBountyIds(this.props.accounts[0], 0).call();
        console.log(countWorks);
        let works = [];
        if(parseInt(countWorks) > 0) {
            for(let i = 0; i < parseInt(countWorks); i++){
                let id = await contract.methods.doerToWorkIds(this.props.accounts[0], i).call();
                let work = await contract.methods.getWorkInfos(id).call();
                works.push(work);
            }
        }
        

        console.log(works);
        this.setState({
            works
        });
    }

    withdrawBalance = async () => {
        const { contract, web3 } = this.props;
        let account = this.props.accounts[0];
        contract.methods.withdrawPending().send({from: account});
        this.setState({
            snackOpen: true
        });
    }

    handleOpenWork = async (work) => {
        console.log(work)
    }


    render() {
        const { classes } = this.props;
        return(
            <div className={classes.root}>
                <div>
                    <Typography className={classes.marginBig} variant="h4" color="primary" align="left">
                        {this.props.accounts[0]}
                    </Typography>
                </div>
                <div style={{marginBottom: 20}}>
                    <Grid container spacing={8} alignItems="center">
                        <Grid item>
                            <b>Balance :</b>
                        </Grid>
                        <Grid item>
                            {this.state.balance} ETH
                        </Grid>
                        {this.state.balance > 0 && (
                            <Grid>
                                <Button variant="contained" color="primary" style={{marginLeft: 10}} onClick={this.withdrawBalance}>
                                    Withdraw balance
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </div>
                {this.state.bounties.length > 0 && (
                    <div>
                        <Divider style={{marginBottom: 20}}/>
                        <BountyList bounties={this.state.bounties} selectBounty={this.props.selectBounty} title="Bounties Submitted"/>
                    </div>
                )}
                {this.state.works.length > 0 && (
                    <div>
                        <Divider style={{marginBottom: 20}}/>
                        <Typography variant="h4">
                            {this.state.works.length} Work(s) Proposed
                        </Typography>
                        <WorkProposedList works={this.state.works} openWork={this.handleOpenWork}/>
                    </div>
                )}  
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    open={this.state.snackOpen}
                    message={<span id="message-id">Waiting to be confirmed on the Ethereum Blockchain...</span>}/>
            </div>
        );
    }
}

ProfilePage.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProfilePage);

