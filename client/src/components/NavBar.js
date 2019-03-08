import React, { Component } from "react";
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';

const styles = {
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
};

class NavBar extends Component {

    render() {
        const { classes } = this.props;
        return(
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton className={classes.menuButton} color="inherit" aria-label="Home" onClick={this.props.goHome}>
                            <HomeIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit" className={classes.grow} align="left">
                            {this.props.title}
                        </Typography>
                        <div>
                            <IconButton color="inherit" aria-label="Account" onClick={this.props.goProfile}>
                                <AccountCircle />
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

NavBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NavBar);