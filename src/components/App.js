import React, { Component } from 'react';
// import Web3 from "web3";
import Image from '../abis/Image.json'



import './App.css';
const ipfsClient = require('ipfs-api')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
var Web3 = require('web3');


class App extends Component {

async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

async loadWeb3() {
  

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
   /*  else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } */
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    .then(console.log)
    const networkData = Image.networks[networkId]
    //console.log(networkId)
    if(networkData) {
      const contract = new web3.eth.Contract(Image.abi, networkData.address)
      this.setState({ contract })
      const imageHash = await contract.methods.get().call()
      this.setState({ imageHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }


  constructor(props){
    super(props);
    this.state = {
      imageHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null

    }; 

  }
  captureFile = (event)=>{
    event.preventDefault();
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({buffer: Buffer.from(reader.result)})
    }
  }
  onSubmitClick = async (event)=>{
      event.preventDefault()
      console.log("Submitting File");
      if(this.state.buffer){
        const file = await ipfs.files.add(this.state.buffer, (error, result) => {
          if(error) {
            console.error(error)
            return
          }
          
          //returns and prints the hash of the file on the ipfs node
            console.log('ipfs hash = ', result[0].hash)  
          return this.setState({ ipfsHash: result[0].hash })
            
          })
        const imageHash = file
        // console.log(imageHash);
        this.state.contract.methods.set(imageHash).send({from: this.state.account}).then((r)=>{
          this.setState({imageHash: imageHash})
        })
      }
    }
    render() {
      return (
        <div className="App">
          <main className="container">
          <nav>
                <h1 >IPFS File Upload</h1>
          </nav>
            <div className="pure-g">
              <div className="pure-u-1-1">
                <h1>The uploaded File:</h1>
                <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>
                <h2>Upload File</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
              </div>
            </div>
          </main>
        </div>
      );
    }
  }
  
  export default App
 