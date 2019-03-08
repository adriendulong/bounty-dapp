import React, { Component } from "react";
import '../App.css';
import { Grid, TextField, Button, Typography, Paper, CircularProgress } from "@material-ui/core";
import 'typeface-roboto';

class NewBountyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: "",
            amount: "",
            title: "",
            loading: false
        }
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    handleSubmit = async (event) => {
        this.setState({
            loading: true
        })
        await this.props.createBounty(this.state.title, this.state.description, this.state.amount)
        this.setState({
            description: "",
            amount: "",
            title: "",
            loading: false
        });
    }

    render() {
        if(this.state.loading) {
            return (
                <CircularProgress/>
            )
        }
        else {
            return(
                <div>
                    <Paper elevation={1} style={{padding: 20}}>
                        <Typography variant="h5" align="left" style={{marginLeft:20}}>
                            Create a new bounty
                        </Typography>
                        <form noValidate autoComplete="off" className="form-general">
                            <Grid
                                container
                                direction="row"
                                justify="flex-start"
                                alignItems="center"
                            >
                                <Grid item>
                                    <TextField
                                        id="input-title"
                                        label="Title"
                                        value={this.state.title}
                                        margin="normal"
                                        onChange={this.handleChange('title')}
                                        variant="outlined"
                                        style={{margin:20, width:200}}
                                        />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="input-description"
                                        label="Description"
                                        multiline
                                        rowsMax="3"
                                        value={this.state.description}
                                        margin="normal"
                                        onChange={this.handleChange('description')}
                                        variant="outlined"
                                        style={{margin:20, width:300}}
                                        />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="input-amount"
                                        label="Amount"
                                        value={this.state.amount}
                                        margin="normal"
                                        type="number"
                                        onChange={this.handleChange('amount')}
                                        variant="outlined"
                                        style={{margin:20, width:200}}
                                        />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                                        Create Bounty
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                    
                </div>
            );
        }
        
    }
}

export default NewBountyForm;

