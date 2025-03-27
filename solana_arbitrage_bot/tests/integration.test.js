const { expect } = require('chai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load test configuration
const testConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config', 'test-config.json'), 'utf8')
);

// API URL
const API_URL = 'http://localhost:5000/api';

describe('Solana Arbitrage Bot Tests', function() {
  this.timeout(30000); // Set timeout to 30 seconds for all tests
  
  before(async function() {
    // Check if server is running
    try {
      await axios.get(`${API_URL}/status`);
      console.log('Server is running');
    } catch (error) {
      console.log('Starting server...');
      // Start server in background
      execSync('cd ../server && node server.js &');
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Check Solana connection
    try {
      const solanaVersion = execSync('solana --version').toString();
      console.log(`Solana CLI: ${solanaVersion}`);
      
      const solanaNetwork = execSync('solana config get').toString();
      console.log(`Solana network: ${solanaNetwork}`);
    } catch (error) {
      console.error('Error checking Solana CLI:', error.message);
      throw new Error('Solana CLI not properly configured');
    }
  });
  
  describe('Server API Tests', function() {
    it('should get bot status', async function() {
      const response = await axios.get(`${API_URL}/status`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('status');
    });
    
    it('should get token pairs', async function() {
      const response = await axios.get(`${API_URL}/token-pairs`);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
    
    it('should get wallets', async function() {
      const response = await axios.get(`${API_URL}/wallets`);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
    
    it('should get transactions', async function() {
      const response = await axios.get(`${API_URL}/transactions`);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
    
    it('should get price data', async function() {
      const response = await axios.get(`${API_URL}/prices/SOL/USDC`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('prices');
    });
    
    it('should get settings', async function() {
      const response = await axios.get(`${API_URL}/settings`);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');
    });
  });
  
  describe('Bot Control Tests', function() {
    it('should start the bot', async function() {
      const response = await axios.post(`${API_URL}/bot/start`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.status).to.equal('running');
    });
    
    it('should stop the bot', async function() {
      const response = await axios.post(`${API_URL}/bot/stop`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.status).to.equal('stopped');
    });
  });
  
  describe('Wallet Integration Tests', function() {
    let newWalletId;
    
    it('should add a wallet', async function() {
      const wallet = {
        name: 'Test Wallet',
        address: testConfig.walletAddress,
        type: 'trading'
      };
      
      const response = await axios.post(`${API_URL}/wallets`, wallet);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.wallet).to.have.property('id');
      
      newWalletId = response.data.wallet.id;
    });
    
    it('should delete a wallet', async function() {
      const response = await axios.delete(`${API_URL}/wallets/${newWalletId}`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });
  
  describe('Settings Tests', function() {
    it('should update settings', async function() {
      const settings = testConfig.testSettings;
      
      const response = await axios.post(`${API_URL}/settings`, settings);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.settings).to.deep.include(settings);
    });
  });
  
  describe('Solana Testnet Tests', function() {
    it('should check wallet balance', function() {
      const balance = execSync(`solana balance ${testConfig.walletAddress} --url ${testConfig.rpcUrl}`).toString();
      console.log(`Wallet balance: ${balance}`);
      expect(parseFloat(balance)).to.be.at.least(0);
    });
    
    it('should verify RPC connection', function() {
      const rpcInfo = execSync(`solana cluster-version --url ${testConfig.rpcUrl}`).toString();
      console.log(`RPC info: ${rpcInfo}`);
      expect(rpcInfo).to.not.be.empty;
    });
  });
  
  // Add more test cases as needed
});
