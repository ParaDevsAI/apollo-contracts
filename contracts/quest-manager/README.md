# QuestManager Smart Contract

O **QuestManager** é um smart contract em Soroban/Rust projetado para gerenciar campanhas de incentivo (quests) no ecossistema Stellar. Ele oferece flexibilidade para criar diferentes tipos de missões com various modos de distribuição de recompensas.

## 🎯 Características Principais

### Tipos de Distribuição
- **Raffle**: Sorteio aleatório entre todos os participantes elegíveis
- **FCFS (First Come, First Served)**: Primeiros usuários a completar a tarefa ganham

### Tipos de Quest Suportadas
- **TradeVolume**: Usuário deve atingir um volume específico de trading
- **PoolPosition**: Usuário deve manter uma posição mínima em um pool de liquidez
- **TokenHold**: Usuário deve manter uma quantidade específica de tokens

### Funcionalidades Avançadas
- Múltiplas quests simultâneas
- Sistema de eventos para monitoramento
- Funções de consulta abrangentes
- Gestão de participantes e ganhadores
- Estatísticas detalhadas por quest e usuário

## 🏗️ Arquitetura

### Estruturas de Dados

```rust
// Tipos de distribuição
pub enum DistributionType {
    Raffle,
    Fcfs,
}

// Tipos de quest
pub enum QuestType {
    TradeVolume { target_volume: u128 },
    PoolPosition { min_position: u128 },
    TokenHold { token: Address, min_amount: u128 },
}

// Estrutura principal da quest
pub struct Quest {
    pub id: u64,
    pub admin: Address,
    pub reward_token: Address,
    pub reward_per_winner: u128,
    pub max_winners: u32,
    pub distribution: DistributionType,
    pub quest_type: QuestType,
    pub end_timestamp: u64,
    pub is_active: bool,
    pub total_reward_pool: u128,
    pub title: String,
    pub description: String,
}
```

## 🚀 Fluxo de Uso

### 1. Criação de Quest (Admin)
```rust
let quest_id = contract.create_quest(
    admin_address,
    reward_token_address,
    1000, // reward_per_winner
    5,    // max_winners
    DistributionType::Raffle,
    QuestType::TradeVolume { target_volume: 10000 },
    3600, // duration_seconds
    5000, // total_reward_pool
    "Volume Challenge",
    "Complete $10k in trading volume"
);
```

### 2. Registro do Usuário
```rust
contract.register(quest_id);
```

### 3. Marcação como Elegível (Backend)
```rust
contract.mark_user_eligible(quest_id, user_address);
```

### 4. Resolução da Quest
```rust
contract.resolve_quest(quest_id); // Faz sorteio se necessário
```

### 5. Distribuição de Recompensas
```rust
contract.distribute_rewards(quest_id);
```

## 📊 Funções de Consulta

### Informações da Quest
- `get_quest(quest_id)`: Detalhes completos de uma quest
- `get_active_quests()`: Lista todas as quests ativas
- `get_quest_stats(quest_id)`: Estatísticas da quest

### Participantes e Ganhadores
- `get_participants(quest_id)`: Lista de participantes elegíveis
- `get_winners(quest_id)`: Lista de ganhadores
- `is_user_registered(quest_id, user)`: Verifica registro

### Informações do Usuário
- `get_user_quests(user)`: Quests do usuário
- `get_quest_counter()`: Contador atual de quests

## 🔐 Segurança

### Controle de Acesso
- Apenas admins podem criar quests
- Apenas o admin da quest pode marcar usuários como elegíveis
- Apenas o admin da quest pode resolver e distribuir recompensas

### Validações
- Verificação de pool de recompensas suficiente
- Validação de timestamps
- Prevenção de duplo registro
- Verificação de quest ativa/expirada

### Tratamento de Erros
```rust
pub enum Error {
    QuestNotFound = 1,
    QuestNotActive = 2,
    QuestExpired = 3,
    QuestNotFinished = 4,
    QuestAlreadyResolved = 5,
    QuestNotResolved = 6,
    AlreadyRegistered = 7,
    UserNotRegistered = 8,
    InvalidMaxWinners = 9,
    InvalidRewardAmount = 10,
    InsufficientRewardPool = 11,
    InvalidDuration = 12,
    NoWinners = 13,
    Unauthorized = 14,
}
```

## 🎮 Casos de Uso

### 1. Campanha de Volume de Trading
- **Objetivo**: Incentivar usuários a negociar na DEX
- **Tipo**: TradeVolume
- **Distribuição**: FCFS para recompensar traders ativos rapidamente

### 2. Programa de Liquidez
- **Objetivo**: Atrair liquidez para pools específicos
- **Tipo**: PoolPosition
- **Distribuição**: Raffle para dar chance igual a todos

### 3. Campanha de Holding
- **Objetivo**: Promover a retenção de tokens específicos
- **Tipo**: TokenHold
- **Distribuição**: Raffle baseado no valor total em holding

## 🔧 Compilação e Deploy

### Requisitos
- Rust 1.70+
- Soroban CLI
- Stellar SDK

### Compilação
```bash
cd contracts/quest-manager
cargo build --target wasm32-unknown-unknown --release
```

### Otimização
```bash
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm
```

### Deploy
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm \
  --source <ACCOUNT> \
  --network testnet
```

## 🧪 Testes

Execute os testes com:
```bash
cargo test
```

Os testes cobrem:
- Criação de quests
- Registro de usuários
- Distribuição FCFS e Raffle
- Resolução de quests
- Funções de consulta
- Casos de erro

## 🔮 Extensibilidade

O contrato foi projetado para ser facilmente extensível:

1. **Novos Tipos de Quest**: Adicione variantes ao enum `QuestType`
2. **Novos Modos de Distribuição**: Adicione ao enum `DistributionType`
3. **Configurações Avançadas**: Use o módulo `types.rs` para adicionar metadados
4. **Integração com Oráculos**: Para validação automática de condições

## 📈 Monitoramento

O contrato emite eventos para facilitar o monitoramento:
- `quest_created`: Nova quest criada
- `user_registered`: Usuário se registrou
- `quest_resolved`: Quest foi resolvida

## 🤝 Integração com Backend

O backend deve:
1. Monitorar DEXs (Blend, Aqua, etc.)
2. Verificar se usuários registrados completaram tarefas
3. Chamar `mark_user_eligible()` quando apropriado
4. Gerenciar resolução e distribuição de recompensas

## 📜 Licença

Este contrato é fornecido como exemplo educacional. Consulte os termos de uso apropriados para implementação em produção.
