import React, { Component } from "react";
import '../App.css';
import WorkProposedList from './WorkProposedList'
import WorkDetailDialog from './WorkDetailDialog';
import { Typography, Grid, Divider, Button, Dialog, AppBar, Toolbar, IconButton, Slide, TextField, Chip, Link } from "@material-ui/core";
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
            isOpened: this.props.bounty.isOpened,
            isWorkFileUploading: false,
            workFile: '',
            workFileHash: null,
            workFileLink: null

        }
        this.workFileInput = React.createRef();
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
        if(!this.state.workFileHash) {
            alert("Can't process the new work, you must provide a file")
        }
        else{
            console.log(this.state.workDescription);
            this.setState({
                open: false
            });
            this.createWork(this.state.workDescription, this.props.bounty.id, this.state.workFileHash);
        }
        
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    resetNewWorkInfos = () => {
        this.setState({
            isWorkFileUploading: false,
            workFile: '',
            workFileHash: null,
            workFileLink: null
        });
    }

    /**
     * Create a new work for this bounty
     */
    createWork = async (description, id, workHashFile) => {
        const { accounts, contract } = this.props;

        await contract.methods.submitWork(description, id, workHashFile).send({ from: accounts[0]});
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

    captureFile = (e) => {
        console.log(e.target.files[0]);
        let file = e.target.files[0];
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => {
            // File is converted to a buffer to prepare for uploading to IPFS
            let buffer = await Buffer.from(reader.result);
            console.log(buffer);
            // Upload the file to IPFS and save the hash
            this.props.ipfs.add({
                path: file.name,
                content: buffer
            }).then(result => {
              let fileHash = result[0].hash;
              console.log('Logo uploaded: ', fileHash);
              this.setState({
                workFileHash: fileHash,
                isWorkFileUploading: false,
                workFileLink: `https://ipfs.io/ipfs/${fileHash}`
              });
            }).catch(err => {
              console.log('Failed to upload the logo to IPFS: ', err);
            })
        };
      
    }

    approveWork = async (work) => {
        this.handleCloseWork();
        
        const { accounts, contract } = this.props;
        try {
            await contract.methods.approveWork(this.props.bounty.id, work.id).send({from: accounts[0]});
            this.setState({
                isOpened: false
            });
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
                                style={{marginBottom: 20}}
                            />
                            <div style={{marginBottom: 10}}>
                                <input
                                className="work-file-input"
                                ref={this.workFileInput}
                                type="file"
                                value={this.state.workFile}
                                onChange={this.captureFile}
                                />
                                <Button 
                                    size="small"
                                    color="primary"
                                    variant="contained"
                                    onClick={() => this.workFileInput.current.click()}
                                >
                                    Add a file
                                </Button>
                            </div>
                            {this.state.workFileHash && (
                                <div>
                                    <Typography variant="body1">
                                        New file added to the work. IPFS hash: <Link href={this.state.workFileLink} variant="body1" target="_blank" rel="noopener noreferrer">{this.state.workFileHash}</Link>
                                    </Typography>
                                </div>
                            )}
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

