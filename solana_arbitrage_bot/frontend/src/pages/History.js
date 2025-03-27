import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Divider, Grid, 
         Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
         TableRow, TablePagination, Chip, IconButton, useTheme } from '@mui/material';
import { 
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Mock transaction history data
const generateMockTransactions = (count) => {
  const types = ['arbitrage', 'flash_loan', 'profit_distribution', 'system'];
  const statuses = ['success', 'failed', 'pending'];
  const tokenPairs = ['SOL/USDC', 'ETH/USDC', 'BTC/USDC', 'RAY/USDC', 'ORCA/USDC'];
  const transactions = [];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tokenPair = tokenPairs[Math.floor(Math.random() * tokenPairs.length)];
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - (i * 30));
    
    let profit = null;
    let amount = null;
    let fee = null;
    let error = null;
    
    if (type === 'arbitrage' && status === 'success') {
      profit = Math.random() * 50 + 5; // Random profit between 5 and 55
    } else if (type === 'flash_loan') {
      amount = Math.random() * 5000 + 500; // Random amount between 500 and 5500
      fee = amount * 0.003; // 0.3% fee
    } else if (status === 'failed') {
      error = 'Transaction failed due to slippage';
    }
    
    transactions.push({
      id: `tx-${i}`,
      type,
      status,
      tokenPair,
      timestamp: date.toISOString(),
      profit,
      amount,
      fee,
      error,
      hash: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 10)}`,
    });
  }
  
  return transactions;
};

const mockTransactions = generateMockTransactions(50);

const History = ({ isConnected, addNotification }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [transactions, setTransactions] = useState(mockTransactions);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Refresh transaction history
  const handleRefresh = () => {
    setTransactions(generateMockTransactions(50));
    addNotification('Transaction history refreshed', 'info');
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'failed':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Get transaction type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'arbitrage':
        return 'Arbitrage';
      case 'flash_loan':
        return 'Flash Loan';
      case 'profit_distribution':
        return 'Profit Distribution';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };
  
  // Get transaction icon
  const getTypeIcon = (type, status) => {
    if (status === 'failed') {
      return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    }
    
    switch (type) {
      case 'arbitrage':
        return <SuccessIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'flash_loan':
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />;
      case 'profit_distribution':
        return <SuccessIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'system':
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Transaction History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your arbitrage bot transaction history and performance
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
            <IconButton color="primary">
              <FilterIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Transaction History */}
      <Card>
        <CardHeader 
          title="Transaction History" 
          subheader={`Showing ${transactions.length} transactions`}
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Token Pair</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Profit/Fee</TableCell>
                  <TableCell>Transaction Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTypeIcon(tx.type, tx.status)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {getTypeLabel(tx.type)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{tx.tokenPair}</TableCell>
                      <TableCell>
                        <Chip 
                          label={tx.status.toUpperCase()} 
                          size="small"
                          sx={{ 
                            bgcolor: `${getStatusColor(tx.status)}20`,
                            color: getStatusColor(tx.status),
                            fontWeight: 'medium',
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(tx.timestamp)}</TableCell>
                      <TableCell>
                        {tx.amount ? `$${tx.amount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {tx.profit ? (
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            +${tx.profit.toFixed(2)}
                          </Typography>
                        ) : tx.fee ? (
                          <Typography variant="body2" color="text.secondary">
                            -${tx.fee.toFixed(2)}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {tx.hash}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Arbitrage Summary" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Arbitrages
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {transactions.filter(tx => tx.type === 'arbitrage').length}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Successful Arbitrages
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {transactions.filter(tx => tx.type === 'arbitrage' && tx.status === 'success').length}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Failed Arbitrages
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {transactions.filter(tx => tx.type === 'arbitrage' && tx.status === 'failed').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Flash Loan Summary" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Flash Loans
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {transactions.filter(tx => tx.type === 'flash_loan').length}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Volume
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${transactions
                    .filter(tx => tx.type === 'flash_loan' && tx.amount)
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Total Fees Paid
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.secondary">
                  ${transactions
                    .filter(tx => tx.type === 'flash_loan' && tx.fee)
                    .reduce((sum, tx) => sum + tx.fee, 0)
                    .toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Profit Summary" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Total Profit
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ${transactions
                    .filter(tx => tx.profit)
                    .reduce((sum, tx) => sum + tx.profit, 0)
                    .toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Average Profit per Trade
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ${(transactions
                    .filter(tx => tx.profit)
                    .reduce((sum, tx) => sum + tx.profit, 0) / 
                    transactions.filter(tx => tx.profit).length || 0)
                    .toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {(transactions.filter(tx => tx.type === 'arbitrage' && tx.status === 'success').length / 
                    transactions.filter(tx => tx.type === 'arbitrage').length * 100 || 0)
                    .toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default History;
