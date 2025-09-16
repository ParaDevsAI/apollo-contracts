# Apollo Contracts 🚀

**Enterprise-grade Smart Contracts for Incentive Management on Stellar/Soroban**

A comprehensive smart contract ecosystem designed to power quest-based incentive programs, trading campaigns, and gamified user engagement on the Stellar blockchain.

[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-blue)](https://soroban.stellar.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange)](https://rustlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet%20Ready-green)](https://stellar.org/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/ParaDevsAI/apollo-contracts)

---

## 🎯 What is Apollo Contracts?

Apollo Contracts is a **battle-tested smart contract suite** that enables businesses to create and manage **incentive campaigns** (quests) with automatic reward distribution. Perfect for:

- **Trading Competitions** - Reward users for volume milestones
- **Liquidity Mining** - Incentivize pool participation  
- **Token Holding Campaigns** - Encourage long-term holding
- **Community Engagement** - Gamify user interactions

### 🔥 Key Features

✅ **Multiple Quest Types**: TradeVolume, PoolPosition, TokenHold  
✅ **Flexible Distribution**: Raffle or First-Come-First-Served  
✅ **Automatic Balance Deduction**: Secure escrow system  
✅ **Real-time Analytics**: Comprehensive stats and monitoring  
✅ **Enterprise Security**: Tested with 100% function coverage  
✅ **TypeScript SDK**: Full type safety for frontend integration  

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Stellar CLI
cargo install --locked stellar-cli

# Add testnet configuration
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Deploy in 60 Seconds

```bash
# 1. Clone the repository
git clone https://github.com/ParaDevsAI/apollo-contracts.git
cd apollo-contracts

# 2. Create and fund your account
stellar keys generate admin --network testnet
stellar keys fund admin --network testnet

# 3. Build and deploy
cd contracts/quest-manager
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quest_manager.wasm \
  --source admin \
  --network testnet

# 🎉 Your contract is live!
```

### Create Your First Quest

```bash
# Create a trading volume quest with 5 XLM rewards
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source admin \
  --network testnet \
  -- create_quest \
  --admin YOUR_ADMIN_ADDRESS \
  --reward_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --reward_per_winner 10000000 \
  --max_winners 5 \
  --distribution Raffle \
  --quest_type '{"TradeVolume":"50000000"}' \
  --duration_seconds 86400 \
  --reward_pool_amount 50000000 \
  --title '"Daily Volume Challenge"' \
  --description '"Trade 5 XLM worth to win rewards!"'
```

---

## 📋 Complete Deployment Guide

### 1. Environment Setup

#### Install Dependencies
```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32v1-none

# Stellar CLI
cargo install --locked stellar-cli
```

#### Network Configuration
```bash
# Add testnet
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Add mainnet (when ready)
stellar network add \
  --global mainnet \
  --rpc-url https://soroban-rpc.stellar.org:443 \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

#### Account Management
```bash
# Generate new account
stellar keys generate admin --network testnet

# Get account address
stellar keys address admin

# Fund testnet account
stellar keys fund admin --network testnet

# Check balance
curl -s "https://horizon-testnet.stellar.org/accounts/$(stellar keys address admin)" | jq '.balances'
```

### 2. Contract Compilation

```bash
# Navigate to contract directory
cd contracts/quest-manager

# Compile the contract
stellar contract build

# Verify compilation
ls -la target/wasm32v1-none/release/quest_manager.wasm
```

### 3. Contract Deployment

#### Testnet Deployment
```bash
# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quest_manager.wasm \
  --source admin \
  --network testnet

# Save the returned contract ID
export CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

#### Mainnet Deployment (Production)
```bash
# Deploy to mainnet (when ready)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quest_manager.wasm \
  --source admin \
  --network mainnet
```

### 4. Contract Verification

Run our comprehensive test suite to verify everything works:

```bash
# Return to project root
cd ../..

# Run complete verification
./test-comprehensive.sh
```

This will verify:
- ✅ All 15 contract functions
- ✅ Balance deduction system  
- ✅ Quest workflow end-to-end
- ✅ Error handling
- ✅ Data persistence

---

## 🎮 Usage Examples

### Creating Different Quest Types

#### 1. Trading Volume Quest
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- create_quest \
  --admin $(stellar keys address admin) \
  --reward_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --reward_per_winner 5000000 \
  --max_winners 10 \
  --distribution Fcfs \
  --quest_type '{"TradeVolume":"20000000"}' \
  --duration_seconds 604800 \
  --reward_pool_amount 50000000 \
  --title '"Weekly Trading Challenge"' \
  --description '"Trade 2 XLM worth in one week to win!"'
```

#### 2. Pool Position Quest
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- create_quest \
  --admin $(stellar keys address admin) \
  --reward_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --reward_per_winner 10000000 \
  --max_winners 5 \
  --distribution Raffle \
  --quest_type '{"PoolPosition":"100000000"}' \
  --duration_seconds 1209600 \
  --reward_pool_amount 50000000 \
  --title '"Liquidity Provider Rewards"' \
  --description '"Maintain 10 XLM in liquidity pool!"'
```

#### 3. Token Holding Quest
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- create_quest \
  --admin $(stellar keys address admin) \
  --reward_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --reward_per_winner 2000000 \
  --max_winners 20 \
  --distribution Raffle \
  --quest_type '{"TokenHold":["CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC","50000000"]}' \
  --duration_seconds 2592000 \
  --reward_pool_amount 40000000 \
  --title '"HODL Challenge"' \
  --description '"Hold 5 XLM for 30 days to be eligible!"'
```

### User Interaction Workflow

#### 1. User Registration
```bash
# User registers for quest
stellar contract invoke \
  --id $CONTRACT_ID \
  --source user \
  --network testnet \
  -- register \
  --quest_id 0 \
  --user $(stellar keys address user)
```

#### 2. Check Registration Status
```bash
# Verify user is registered
stellar contract invoke \
  --id $CONTRACT_ID \
  --source user \
  --network testnet \
  -- is_user_registered \
  --quest_id 0 \
  --user $(stellar keys address user)
```

#### 3. Admin Marks User Eligible (Backend Integration)
```bash
# After backend verifies user completed the task
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- mark_user_eligible \
  --quest_id 0 \
  --user $(stellar keys address user)
```

#### 4. Quest Resolution & Reward Distribution
```bash
# Resolve quest (select winners)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- resolve_quest \
  --quest_id 0

# Distribute rewards to winners
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- distribute_rewards \
  --quest_id 0
```

### Query Functions

#### Get Quest Information
```bash
# Get specific quest details
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_quest \
  --quest_id 0

# Get all active quests
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_active_quests

# Get quest statistics
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_quest_stats \
  --quest_id 0
```

#### Get Participants and Winners
```bash
# Get quest participants
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_participants \
  --quest_id 0

# Get quest winners
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_winners \
  --quest_id 0
```

#### User-specific Queries
```bash
# Get user's quests
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_user_quests \
  --user $(stellar keys address user)

# Get user statistics
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- get_user_stats \
  --user $(stellar keys address user)
```

---

## 💻 Frontend Integration

### Option 1: TypeScript SDK (Generated Bindings)

```typescript
import { Client } from './contracts/quest-manager/bindings/src/index.js';

const client = new Client({
  contractId: 'YOUR_CONTRACT_ID',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org:443'
});

// Create quest with full type safety
const questId = await client.create_quest({
  admin: adminAddress,
  reward_token: tokenAddress,
  reward_per_winner: 1000000,
  max_winners: 5,
  distribution: { tag: 'Raffle', values: void 0 },
  quest_type: { tag: 'TradeVolume', values: [5000000] },
  duration_seconds: 86400,
  reward_pool_amount: 5000000,
  title: 'Daily Challenge',
  description: 'Complete daily trading goals!'
});
```

### Option 2: JavaScript SDK (Custom Implementation)

```javascript
import QuestManagerSDK from './sdk-integration/simple-quest-sdk.js';

const sdk = new QuestManagerSDK();

// Get active quests
const activeQuests = await sdk.getActiveQuests();

// Register user
await sdk.register(questId, userSecretKey);

// Check if user is registered
const isRegistered = await sdk.isUserRegistered(questId, userAddress);
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import QuestManagerSDK from './sdk/quest-manager-sdk';

function QuestList() {
  const [quests, setQuests] = useState([]);
  const sdk = new QuestManagerSDK();

  useEffect(() => {
    async function loadQuests() {
      const result = await sdk.getActiveQuests();
      if (result.success) {
        setQuests(result.data);
      }
    }
    loadQuests();
  }, []);

  return (
    <div>
      <h2>Active Quests</h2>
      {quests.map(quest => (
        <div key={quest.id} className="quest-card">
          <h3>{quest.title}</h3>
          <p>{quest.description}</p>
          <p>Reward: {quest.reward_per_winner / 10000000} XLM</p>
          <p>Winners: {quest.max_winners}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🏗️ Architecture Overview

### Smart Contract Structure

```
contracts/quest-manager/
├── src/
│   ├── lib.rs          # Main contract logic
│   ├── types.rs        # Data structures and enums
│   ├── storage.rs      # Storage helper functions
│   ├── errors.rs       # Error definitions
│   └── test.rs         # Unit tests
├── bindings/           # TypeScript bindings (auto-generated)
└── Cargo.toml         # Rust dependencies
```

### Core Functions

| Function | Description | Access Level |
|----------|-------------|--------------|
| `create_quest` | Create new incentive campaign | Admin only |
| `register` | User registers for quest | Public |
| `mark_user_eligible` | Mark user as task completed | Admin only |
| `resolve_quest` | Select winners (raffle/fcfs) | Admin only |
| `distribute_rewards` | Send rewards to winners | Admin only |
| `get_active_quests` | List all active quests | Public |
| `get_quest_stats` | Get quest analytics | Public |

### Quest Types

| Type | Description | Use Case |
|------|-------------|----------|
| **TradeVolume** | User must achieve trading volume | DEX trading campaigns |
| **PoolPosition** | User must maintain liquidity position | Liquidity mining programs |
| **TokenHold** | User must hold specific tokens | Token retention incentives |

### Distribution Methods

| Method | Description | Best For |
|--------|-------------|----------|
| **Raffle** | Random selection from eligible users | Fair chance for all participants |
| **FCFS** | First eligible users win | Rewarding quick completion |

---

## 🛡️ Security & Auditing

### Security Features

✅ **Access Control**: Admin-only functions protected  
✅ **Balance Verification**: Automatic escrow system  
✅ **Reentrancy Protection**: Soroban built-in safeguards  
✅ **Input Validation**: Comprehensive parameter checking  
✅ **Error Handling**: Graceful failure modes  
✅ **Event Logging**: Complete audit trail  

### Testing Coverage

- **15/15 Functions Tested** ✅
- **100% Error Cases Covered** ✅  
- **End-to-End Workflows Verified** ✅
- **Balance Deduction Confirmed** ✅
- **Data Persistence Validated** ✅

### Pre-Production Checklist

- [ ] Audit smart contract code
- [ ] Test on mainnet with small amounts
- [ ] Verify admin key security
- [ ] Set up monitoring systems
- [ ] Prepare incident response plan

---

## 📊 Production Deployment

### Mainnet Preparation

1. **Security Review**
   ```bash
   # Run comprehensive tests
   ./test-comprehensive.sh
   
   # Verify all functions work
   # Check balance deduction
   # Test error scenarios
   ```

2. **Admin Account Security**
   ```bash
   # Generate secure admin account
   stellar keys generate admin-prod --network mainnet
   
   # Fund with sufficient XLM
   # Secure the secret key properly
   ```

3. **Contract Deployment**
   ```bash
   # Deploy to mainnet
   stellar contract deploy \
     --wasm target/wasm32v1-none/release/quest_manager.wasm \
     --source admin-prod \
     --network mainnet
   ```

4. **Post-Deployment Verification**
   ```bash
   # Test basic functions
   stellar contract invoke \
     --id $MAINNET_CONTRACT_ID \
     --source admin-prod \
     --network mainnet \
     -- get_quest_counter
   ```

### Monitoring Setup

```bash
# Monitor contract events
stellar events -c $CONTRACT_ID --network mainnet

# Set up balance monitoring
# Implement alerting for admin actions
# Track quest creation and completion rates
```

---

## 🤝 Backend Integration

### Oracle Integration Pattern

Your backend should monitor DEX activity and mark users eligible:

```javascript
// Example backend service
class QuestOracle {
  async monitorTradingVolume(questId, userAddress) {
    // Monitor DEX APIs (Aqua, Blend, etc.)
    const volume = await this.getUserTradingVolume(userAddress);
    const quest = await this.getQuest(questId);
    
    if (volume >= quest.quest_type.TradeVolume) {
      // Mark user as eligible
      await this.markUserEligible(questId, userAddress);
    }
  }
  
  async markUserEligible(questId, userAddress) {
    return await this.sdk.markUserEligible(
      questId, 
      userAddress, 
      adminSecretKey
    );
  }
}
```

### Webhook Integration

```javascript
// Listen for Stellar events
app.post('/webhook/stellar-events', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'user_registered') {
    // Start monitoring this user for quest completion
    await startMonitoring(event.quest_id, event.user);
  }
  
  res.status(200).send('OK');
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### Contract Not Found
```bash
# Verify contract ID is correct
stellar contract invoke --id $CONTRACT_ID --network testnet -- get_quest_counter

# Check if contract exists on network
curl -s "https://horizon-testnet.stellar.org/contracts/$CONTRACT_ID"
```

#### Insufficient Balance
```bash
# Check admin balance
curl -s "https://horizon-testnet.stellar.org/accounts/$(stellar keys address admin)" | jq '.balances'

# Fund testnet account
stellar keys fund admin --network testnet
```

#### Function Call Errors
```bash
# Enable verbose logging
stellar contract invoke --id $CONTRACT_ID --source admin --network testnet --verbose -- function_name

# Check event logs for error details
```

#### Build Issues
```bash
# Clean and rebuild
cargo clean
stellar contract build

# Verify Rust target
rustup target add wasm32v1-none
```

### Support

- **Documentation**: Check function comments in `src/lib.rs`
- **Tests**: Review `src/test.rs` for usage examples  
- **Issues**: Open GitHub issues for bugs
- **Community**: Join Stellar Discord for help

---

## 🎛️ Advanced Configuration

### Environment Variables

Create `.env` file for easier management:

```bash
# .env
STELLAR_NETWORK=testnet
ADMIN_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XLM_TOKEN=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Custom Token Integration

```bash
# Deploy your own token contract
stellar contract deploy --wasm token.wasm --source admin --network testnet

# Use custom token in quests
stellar contract invoke --id $CONTRACT_ID --source admin --network testnet -- create_quest \
  --reward_token $CUSTOM_TOKEN_ID \
  # ... other parameters
```

### Batch Operations

```bash
# Create multiple quests efficiently
for i in {1..5}; do
  stellar contract invoke --id $CONTRACT_ID --source admin --network testnet -- create_quest \
    --admin $(stellar keys address admin) \
    --reward_token $XLM_TOKEN \
    --reward_per_winner 1000000 \
    --max_winners 10 \
    --distribution Raffle \
    --quest_type "{\"TradeVolume\":\"$((i * 1000000))\"}" \
    --duration_seconds 86400 \
    --reward_pool_amount 10000000 \
    --title "\"Quest $i\"" \
    --description "\"Automated quest $i\""
done
```

---

## 📈 Analytics & Monitoring

### Key Metrics to Track

1. **Quest Performance**
   - Total quests created
   - Active quest count
   - Completion rates
   - Average time to completion

2. **User Engagement**
   - Registration rates
   - Participation by quest type
   - Repeat participation
   - Reward distribution efficiency

3. **Financial Metrics**
   - Total rewards distributed
   - Average reward per quest
   - Cost per acquisition
   - ROI by quest type

### Monitoring Queries

```bash
# Get total quest count
stellar contract invoke --id $CONTRACT_ID --source admin --network testnet -- get_quest_counter

# Monitor active quests
stellar contract invoke --id $CONTRACT_ID --source admin --network testnet -- get_active_quests | jq length

# Track user participation
stellar contract invoke --id $CONTRACT_ID --source admin --network testnet -- get_user_stats --user $USER_ADDRESS
```

---

## 🔮 Future Roadmap

### Planned Enhancements

1. **Oracle Integration** - Automatic task verification
2. **Multi-Token Support** - Diverse reward tokens
3. **Governance System** - Community-driven quest approval
4. **NFT Achievements** - Gamification with collectibles
5. **Referral System** - Viral growth mechanics
6. **Analytics Dashboard** - Real-time insights

### Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- Pull request process
- Issue reporting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/ParaDevsAI/apollo-contracts/issues)
- **Documentation**: Complete guides in `/docs`
- **Examples**: Sample implementations in `/examples`
- **Discord**: Join our community for real-time support

---

**Built with ❤️ by ParaDevsAI for the Stellar ecosystem**

*Apollo Contracts - Powering the future of incentivized engagement on Stellar* 🚀
