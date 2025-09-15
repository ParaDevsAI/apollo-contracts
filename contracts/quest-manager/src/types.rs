use soroban_sdk::{contracttype, Address, String};

// Estruturas de dados para tipos específicos de quest
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TradeVolumeQuest {
    pub target_volume: u128,
    pub dex_address: Address, // DEX específica onde o volume deve ser atingido
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PoolPositionQuest {
    pub min_position: u128,
    pub pool_address: Address, // Pool específico
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenHoldQuest {
    pub token: Address,
    pub min_amount: u128,
    pub hold_duration: u64, // Tempo mínimo que deve manter o token
}

// Estrutura para configurações avançadas de quest
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestConfig {
    pub allow_multiple_entries: bool, // Permite múltiplas participações do mesmo usuário
    pub require_kyc: bool, // Requer KYC para participar
    pub min_account_age: u64, // Idade mínima da conta em segundos
    pub geographic_restrictions: String, // Restrições geográficas (JSON string)
}

// Estrutura para metadados da quest
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestMetadata {
    pub category: String, // Ex: "Trading", "Liquidity", "Holding"
    pub difficulty: u32, // 1-5, sendo 5 a mais difícil
    pub estimated_completion_time: u64, // Tempo estimado em segundos
    pub external_url: String, // URL para mais informações
    pub image_url: String, // URL da imagem da quest
}
