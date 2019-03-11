import React, { Component } from "react";
import NavBar from './components/NavBar'
import NewBountyForm from './components/NewBountyForm'
import BountyList from './components/BountyList'
import BountyPage from './components/BountyPage'
import ProfilePage from './components/ProfilePage'
import BountyApp from "./contracts/BountyApp.json";
import getWeb3 from "./utils/getWeb3";
import { Divider } from '@material-ui/core';
import { createMuiTheme, withTheme,  MuiThemeProvider } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import deepOrange from '@material-ui/core/colors/deepOrange';
import IPFS from 'ipfs';

import "./App.css";

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: deepOrange
  },
});

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, bounties: null, selectedBounty: null, navText: "Bounty App", profile: false, ipfsNode: null, nodeReady: false };

  componentDidMount = async () => {
    try {
      const node = new IPFS();
      node.on('ready', async () => {
        const version = await node.version()
      
        console.log('Version:', version.version)
        this.setState({
          nodeReady: true
        });
      })

      // Get network provider and web3 instance.
      const web3 = await getWeb3(this.changedAccount);

      //web3.currentProvider.publicConfigStore.on('update', this.changedAccount);

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BountyApp.networks[networkId];
      const instance = new web3.eth.Contract(
        BountyApp.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, ipfsNode: node }, this.getLastBounties);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  changedAccount = (accounts) => {
    console.log("CHANGED")
    this.setState({
      accounts
    });
    window.location.reload();
  }

  /**
   * Create a new bounty
   */
  createBounty = async (title, description, amount) => {
    const { web3, accounts, contract } = this.state;

    const amountForBounty = web3.utils.toWei(amount);
    await contract.methods.createBounty(amountForBounty, title, description).send({ from: accounts[0], value: amountForBounty });
    await this.getLastBounties();
  }

  /**
   * Get the list of x last bounties created
   */
  getLastBounties = async () => {
    const { contract } = this.state;

    let actualBountyId = await contract.methods.getLastBountyId().call();
    let bountyIdNumber = parseInt(actualBountyId)
    let bountyIds = [];
    let i = 10;
    while(i > 0 && bountyIdNumber > 0) {
      bountyIds.push(bountyIdNumber);
      bountyIdNumber--;
      i--;
    }

    // Get all the bounties infos
    var results = await Promise.all(bountyIds.map(async (id) => {
      const bounty = contract.methods.getBountyInfos(id).call();
      return bounty;
    }));

    console.log(results);

    this.setState({bounties: results});
  }

  handleGoHome = () => {
    this.setState({
      profile: false,
      selectedBounty: null,
      navText: "App Bounty"
    });
  }

  handleGoProfile = () => {
    this.setState({
      profile: true,
      selectedBounty: null,
      navText: "Bounty App > Profile"
    })
  }

  handleSelectBounty = (bounty) => {
    console.log(bounty);
    this.setState({
      profile: false,
      selectedBounty: bounty,
      navText: `Bounty App > Bounty #${bounty.id}`
    });
  }

  handleQuitBounty = () => {
    this.setState({
      selectedBounty: null,
      navText: "Bounty App"
    });
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    else {
      return (
        <MuiThemeProvider theme={theme}>
          <div className="App">
            <NavBar title={this.state.navText} goHome={this.handleGoHome} goProfile={this.handleGoProfile}/>
            {this.state.selectedBounty && (
              <BountyPage bounty={this.state.selectedBounty} web3={this.state.web3} contract={this.state.contract} accounts={this.state.accounts} quitBounty={this.handleQuitBounty} ipfs={this.state.ipfsNode}/>
            )}
            {!this.state.selectedBounty && !this.state.profile && (
              <div>
                <div style={{ padding: 20 }}>
                  <NewBountyForm createBounty={this.createBounty}/>
                </div>
                <Divider/>
                <div style={{marginTop: 30}}>
                  <BountyList bounties={this.state.bounties} selectBounty={this.handleSelectBounty} title="Last Bounties"/>
                </div>
              </div>
            )}
            {this.state.profile && (
              <ProfilePage accounts={this.state.accounts} contract={this.state.contract} web3={this.state.web3} selectBounty={this.handleSelectBounty}></ProfilePage>
            )}
          </div>
        </MuiThemeProvider>
        
      );
    }
  }
}

export default withTheme()(App);
