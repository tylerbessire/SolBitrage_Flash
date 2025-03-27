// Profit Management Module for Solana Flash Loan Arbitrage Bot
// Handles profit tracking, distribution, and reinvestment

use solana_sdk::{
    pubkey::Pubkey,
    signature::Keypair,
    transaction::Transaction,
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Configuration for profit distribution
pub struct ProfitDistributionConfig {
    /// Percentage of profits to reinvest (0-100)
    pub reinvestment_percentage: u8,
    /// Percentage of profits to withdraw to owner wallet (0-100)
    pub withdrawal_percentage: u8,
    /// Percentage of profits to keep as reserve (0-100)
    pub reserve_percentage: u8,
    /// Owner wallet address for profit withdrawals
    pub owner_wallet: Pubkey,
    /// Minimum profit amount required before distribution (in lamports)
    pub min_distribution_amount: u64,
}

impl ProfitDistributionConfig {
    /// Create a new profit distribution configuration
    pub fn new(
        reinvestment_percentage: u8,
        withdrawal_percentage: u8,
        reserve_percentage: u8,
        owner_wallet: Pubkey,
        min_distribution_amount: u64,
    ) -> Result<Self, String> {
        // Validate that percentages add up to 100
        if reinvestment_percentage + withdrawal_percentage + reserve_percentage != 100 {
            return Err("Profit distribution percentages must add up to 100".to_string());
        }
        
        Ok(Self {
            reinvestment_percentage,
            withdrawal_percentage,
            reserve_percentage,
            owner_wallet,
            min_distribution_amount,
        })
    }
    
    /// Create a default profit distribution configuration (70% reinvest, 30% withdraw)
    pub fn default(owner_wallet: Pubkey) -> Self {
        Self {
            reinvestment_percentage: 70,
            withdrawal_percentage: 30,
            reserve_percentage: 0,
            owner_wallet,
            min_distribution_amount: 1_000_000, // 0.001 SOL in lamports
        }
    }
}

/// Profit tracking for a specific token
pub struct TokenProfit {
    /// Token mint address
    pub token_mint: Pubkey,
    /// Total profit accumulated (in token's smallest unit)
    pub total_profit: u64,
    /// Distributed profit (in token's smallest unit)
    pub distributed_profit: u64,
    /// Undistributed profit (in token's smallest unit)
    pub undistributed_profit: u64,
    /// Number of successful trades
    pub successful_trades: u64,
    /// Number of failed trades
    pub failed_trades: u64,
}

impl TokenProfit {
    /// Create a new token profit tracker
    pub fn new(token_mint: Pubkey) -> Self {
        Self {
            token_mint,
            total_profit: 0,
            distributed_profit: 0,
            undistributed_profit: 0,
            successful_trades: 0,
            failed_trades: 0,
        }
    }
    
    /// Record a new profit
    pub fn record_profit(&mut self, amount: u64) {
        self.total_profit += amount;
        self.undistributed_profit += amount;
        self.successful_trades += 1;
    }
    
    /// Record a failed trade
    pub fn record_failed_trade(&mut self) {
        self.failed_trades += 1;
    }
    
    /// Distribute profit
    pub fn distribute_profit(&mut self, amount: u64) -> Result<u64, String> {
        if amount > self.undistributed_profit {
            return Err(format!(
                "Cannot distribute {} - only {} available",
                amount, self.undistributed_profit
            ));
        }
        
        self.undistributed_profit -= amount;
        self.distributed_profit += amount;
        
        Ok(amount)
    }
    
    /// Get success rate as a percentage
    pub fn success_rate(&self) -> f64 {
        if self.successful_trades + self.failed_trades == 0 {
            return 0.0;
        }
        
        (self.successful_trades as f64 / (self.successful_trades + self.failed_trades) as f64) * 100.0
    }
}

/// Profit management system
pub struct ProfitManager {
    /// Configuration for profit distribution
    config: ProfitDistributionConfig,
    /// Profit tracking by token
    token_profits: HashMap<Pubkey, TokenProfit>,
    /// Total SOL profit in lamports
    total_sol_profit: u64,
    /// Total USD value of profit (in cents)
    total_usd_profit: u64,
}

impl ProfitManager {
    /// Create a new profit manager
    pub fn new(config: ProfitDistributionConfig) -> Self {
        Self {
            config,
            token_profits: HashMap::new(),
            total_sol_profit: 0,
            total_usd_profit: 0,
        }
    }
    
    /// Record profit for a specific token
    pub fn record_profit(&mut self, token_mint: Pubkey, amount: u64, sol_value: u64, usd_value: u64) {
        // Update token-specific profit
        let token_profit = self.token_profits
            .entry(token_mint)
            .or_insert_with(|| TokenProfit::new(token_mint));
        
        token_profit.record_profit(amount);
        
        // Update total profits
        self.total_sol_profit += sol_value;
        self.total_usd_profit += usd_value;
    }
    
    /// Record a failed trade for a specific token
    pub fn record_failed_trade(&mut self, token_mint: Pubkey) {
        let token_profit = self.token_profits
            .entry(token_mint)
            .or_insert_with(|| TokenProfit::new(token_mint));
        
        token_profit.record_failed_trade();
    }
    
    /// Distribute profits according to configuration
    pub fn distribute_profits(&mut self, wallet_manager: &WalletManager) -> Result<DistributionResult, String> {
        let mut result = DistributionResult {
            reinvested_amount: 0,
            withdrawn_amount: 0,
            reserved_amount: 0,
        };
        
        // Iterate through all tokens with undistributed profits
        for (token_mint, token_profit) in &mut self.token_profits {
            if token_profit.undistributed_profit < self.config.min_distribution_amount {
                continue; // Skip if below minimum distribution amount
            }
            
            let amount_to_distribute = token_profit.undistributed_profit;
            
            // Calculate amounts based on percentages
            let reinvest_amount = (amount_to_distribute * self.config.reinvestment_percentage as u64) / 100;
            let withdraw_amount = (amount_to_distribute * self.config.withdrawal_percentage as u64) / 100;
            let reserve_amount = amount_to_distribute - reinvest_amount - withdraw_amount;
            
            // Update token profit tracking
            token_profit.distribute_profit(amount_to_distribute)?;
            
            // Update result
            result.reinvested_amount += reinvest_amount;
            result.withdrawn_amount += withdraw_amount;
            result.reserved_amount += reserve_amount;
            
            // TODO: Implement actual token transfers using wallet_manager
            // This would involve creating and sending transactions
        }
        
        Ok(result)
    }
    
    /// Get profit statistics
    pub fn get_statistics(&self) -> ProfitStatistics {
        let mut total_successful_trades = 0;
        let mut total_failed_trades = 0;
        
        for token_profit in self.token_profits.values() {
            total_successful_trades += token_profit.successful_trades;
            total_failed_trades += token_profit.failed_trades;
        }
        
        let overall_success_rate = if total_successful_trades + total_failed_trades == 0 {
            0.0
        } else {
            (total_successful_trades as f64 / (total_successful_trades + total_failed_trades) as f64) * 100.0
        };
        
        ProfitStatistics {
            total_sol_profit: self.total_sol_profit,
            total_usd_profit: self.total_usd_profit,
            total_successful_trades,
            total_failed_trades,
            overall_success_rate,
            token_count: self.token_profits.len() as u64,
        }
    }
    
    /// Update distribution configuration
    pub fn update_config(&mut self, config: ProfitDistributionConfig) {
        self.config = config;
    }
}

/// Result of profit distribution
pub struct DistributionResult {
    /// Amount reinvested
    pub reinvested_amount: u64,
    /// Amount withdrawn to owner wallet
    pub withdrawn_amount: u64,
    /// Amount kept as reserve
    pub reserved_amount: u64,
}

/// Profit statistics
pub struct ProfitStatistics {
    /// Total SOL profit in lamports
    pub total_sol_profit: u64,
    /// Total USD value of profit (in cents)
    pub total_usd_profit: u64,
    /// Total number of successful trades
    pub total_successful_trades: u64,
    /// Total number of failed trades
    pub total_failed_trades: u64,
    /// Overall success rate as a percentage
    pub overall_success_rate: f64,
    /// Number of tokens traded
    pub token_count: u64,
}

// This is a placeholder for the WalletManager that will be implemented in the wallet_integration module
pub struct WalletManager;

/// Thread-safe wrapper for ProfitManager
pub struct ThreadSafeProfitManager {
    inner: Arc<Mutex<ProfitManager>>,
}

impl ThreadSafeProfitManager {
    /// Create a new thread-safe profit manager
    pub fn new(config: ProfitDistributionConfig) -> Self {
        Self {
            inner: Arc::new(Mutex::new(ProfitManager::new(config))),
        }
    }
    
    /// Record profit (thread-safe)
    pub fn record_profit(&self, token_mint: Pubkey, amount: u64, sol_value: u64, usd_value: u64) -> Result<(), String> {
        let mut manager = self.inner.lock().map_err(|e| format!("Lock error: {}", e))?;
        manager.record_profit(token_mint, amount, sol_value, usd_value);
        Ok(())
    }
    
    /// Record failed trade (thread-safe)
    pub fn record_failed_trade(&self, token_mint: Pubkey) -> Result<(), String> {
        let mut manager = self.inner.lock().map_err(|e| format!("Lock error: {}", e))?;
        manager.record_failed_trade(token_mint);
        Ok(())
    }
    
    /// Distribute profits (thread-safe)
    pub fn distribute_profits(&self, wallet_manager: &WalletManager) -> Result<DistributionResult, String> {
        let mut manager = self.inner.lock().map_err(|e| format!("Lock error: {}", e))?;
        manager.distribute_profits(wallet_manager)
    }
    
    /// Get profit statistics (thread-safe)
    pub fn get_statistics(&self) -> Result<ProfitStatistics, String> {
        let manager = self.inner.lock().map_err(|e| format!("Lock error: {}", e))?;
        Ok(manager.get_statistics())
    }
    
    /// Update distribution configuration (thread-safe)
    pub fn update_config(&self, config: ProfitDistributionConfig) -> Result<(), String> {
        let mut manager = self.inner.lock().map_err(|e| format!("Lock error: {}", e))?;
        manager.update_config(config);
        Ok(())
    }
}
