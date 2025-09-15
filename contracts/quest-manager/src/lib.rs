#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Vec, Symbol, String, panic_with_error
};

mod types;
mod storage;
mod errors;

#[cfg(test)]
mod test;

pub use types::*;
pub use storage::*;
pub use errors::*;

// Enum para o tipo de distribuição
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DistributionType {
    Raffle, // Sorteio aleatório no final
    Fcfs,   // Primeiro a chegar, primeiro a ser servido
}

// Enum para o tipo de tarefa que o usuário deve cumprir
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestType {
    TradeVolume(u128), // Faça X de volume
    PoolPosition(u128), // Tenha pelo menos X em um pool
    TokenHold(Address, u128), // Holde X unidades do token Y
}

// Struct principal que define uma campanha/missão
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
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

// Chaves para o armazenamento
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Quests(u64), // Armazena a struct Quest para um dado ID
    QuestCounter, // Um contador para gerar novos IDs de Quest
    Participants(u64), // Lista de participantes elegíveis para uma Quest (ID => Vec<Address>)
    Winners(u64), // Lista de ganhadores para uma Quest (ID => Vec<Address>)
    Registrations(u64, Address), // Usuário se registrou na Quest? (Quest ID, User Address) => bool
    QuestIds, // Lista de todos os IDs de Quest para iteração
    UserQuests(Address), // Quests em que um usuário específico está participando
}

// Struct para eventos
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestCreatedEvent {
    pub quest_id: u64,
    pub admin: Address,
    pub reward_token: Address,
    pub distribution: DistributionType,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserRegisteredEvent {
    pub quest_id: u64,
    pub user: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestResolvedEvent {
    pub quest_id: u64,
    pub winners_count: u32,
}

#[contract]
pub struct QuestManager;

#[contractimpl]
impl QuestManager {
    /// Cria uma nova quest/campanha
    /// Apenas o admin pode criar quests
    pub fn create_quest(
        env: Env,
        admin: Address,
        reward_token: Address,
        reward_per_winner: u128,
        max_winners: u32,
        distribution: DistributionType,
        quest_type: QuestType,
        duration_seconds: u64,
        reward_pool_amount: u128,
        title: String,
        description: String,
    ) -> u64 {
        admin.require_auth(); // Apenas o admin pode criar uma quest

        // Validações básicas
        if max_winners == 0 {
            panic_with_error!(&env, Error::InvalidMaxWinners);
        }
        if reward_per_winner == 0 {
            panic_with_error!(&env, Error::InvalidRewardAmount);
        }
        if reward_pool_amount < (reward_per_winner * max_winners as u128) {
            panic_with_error!(&env, Error::InsufficientRewardPool);
        }
        if duration_seconds == 0 {
            panic_with_error!(&env, Error::InvalidDuration);
        }
        //Verifica se usuario tem saldo para pagar a reward pool
        if reward_pool_amount > 0  {
            let reward_token_client = token::Client::new(&env, &reward_token);
            let balance = reward_token_client.balance(&admin);
            if balance < reward_pool_amount {
                panic_with_error!(&env, Error::InsufficientBalance); 
            }
        }

        // Transfere os tokens de recompensa para o contrato
        reward_token_client.transfer(
            &admin,
            &env.current_contract_address(),
            &(reward_pool_amount as i128)
        );

        // Gera um novo ID para a quest
        let quest_id: u64 = env.storage().instance().get(&DataKey::QuestCounter).unwrap_or(0);
        env.storage().instance().set(&DataKey::QuestCounter, &(quest_id + 1));

        let new_quest = Quest {
            id: quest_id,
            admin: admin.clone(),
            reward_token: reward_token.clone(),
            reward_per_winner,
            max_winners,
            distribution,
            quest_type,
            end_timestamp: env.ledger().timestamp() + duration_seconds,
            is_active: true,
            total_reward_pool: reward_pool_amount,
            title,
            description,
        };

        // Armazena a nova quest
        env.storage().persistent().set(&DataKey::Quests(quest_id), &new_quest);
        
        // Atualiza a lista de IDs de quest
        let mut quest_ids: Vec<u64> = env.storage().persistent().get(&DataKey::QuestIds).unwrap_or(Vec::new(&env));
        quest_ids.push_back(quest_id);
        env.storage().persistent().set(&DataKey::QuestIds, &quest_ids);

        // Inicializa listas vazias para participantes e ganhadores
        let empty_vec: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::Participants(quest_id), &empty_vec);
        env.storage().persistent().set(&DataKey::Winners(quest_id), &empty_vec);

        // Emit event
        env.events().publish((Symbol::new(&env, "quest_created"),), QuestCreatedEvent {
            quest_id,
            admin,
            reward_token,
            distribution,
        });

        quest_id // Retorna o ID da nova quest
    }

    /// Permite que um usuário se registre para participar de uma quest
    pub fn register(env: Env, quest_id: u64, user: Address) {
        user.require_auth(); // Garante que o usuário está assinando a transação

        // Verifica se a quest existe e está ativa
        let quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));
        
        if !quest.is_active {
            panic_with_error!(&env, Error::QuestNotActive);
        }
        
        if env.ledger().timestamp() > quest.end_timestamp {
            panic_with_error!(&env, Error::QuestExpired);
        }

        // Verifica se o usuário já está registrado
        if env.storage().persistent().has(&DataKey::Registrations(quest_id, user.clone())) {
            panic_with_error!(&env, Error::AlreadyRegistered);
        }

        // Registra o usuário
        env.storage().persistent().set(&DataKey::Registrations(quest_id, user.clone()), &true);

        // Atualiza a lista de quests do usuário
        let mut user_quests: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserQuests(user.clone()))
            .unwrap_or(Vec::new(&env));
        user_quests.push_back(quest_id);
        env.storage().persistent().set(&DataKey::UserQuests(user.clone()), &user_quests);

        // Emit event
        env.events().publish((Symbol::new(&env, "user_registered"),), UserRegisteredEvent {
            quest_id,
            user,
        });
    }

    /// Marca um usuário como elegível (chamado pelo backend quando o usuário completa a tarefa)
    pub fn mark_user_eligible(env: Env, quest_id: u64, user: Address) {
        // Verifica se a quest existe
        let quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));
        
        // Apenas o admin da quest pode chamar esta função (nosso back-end)
        quest.admin.require_auth();

        if !quest.is_active {
            panic_with_error!(&env, Error::QuestNotActive);
        }

        // Verifica se o usuário se registrou
        if !env.storage().persistent().has(&DataKey::Registrations(quest_id, user.clone())) {
            panic_with_error!(&env, Error::UserNotRegistered);
        }

        // Lógica de adição baseada no tipo de distribuição
        match quest.distribution {
            DistributionType::Fcfs => {
                let mut winners: Vec<Address> = env.storage().persistent()
                    .get(&DataKey::Winners(quest_id))
                    .unwrap_or(Vec::new(&env));
                
                if winners.len() < quest.max_winners {
                    if !winners.contains(&user) { // Evita adicionar o mesmo ganhador duas vezes
                        winners.push_back(user);
                        env.storage().persistent().set(&DataKey::Winners(quest_id), &winners);
                    }
                }
            },
            DistributionType::Raffle => {
                let mut participants: Vec<Address> = env.storage().persistent()
                    .get(&DataKey::Participants(quest_id))
                    .unwrap_or(Vec::new(&env));
                
                if !participants.contains(&user) { // Evita adicionar o mesmo participante duas vezes
                    participants.push_back(user);
                    env.storage().persistent().set(&DataKey::Participants(quest_id), &participants);
                }
            }
        }
    }

    /// Resolve uma quest (faz o sorteio se necessário)
    pub fn resolve_quest(env: Env, quest_id: u64) {
        let quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));
        
        quest.admin.require_auth();

        if env.ledger().timestamp() < quest.end_timestamp {
            panic_with_error!(&env, Error::QuestNotFinished);
        }

        if !quest.is_active {
            panic_with_error!(&env, Error::QuestAlreadyResolved);
        }

        // Se for Raffle, faz o sorteio agora
        if quest.distribution == DistributionType::Raffle {
            let participants: Vec<Address> = env.storage().persistent()
                .get(&DataKey::Participants(quest_id))
                .unwrap_or(Vec::new(&env));
            
            let mut winners: Vec<Address> = Vec::new(&env);
            
            // Lógica de sorteio usando timestamp e hash como semente
            if !participants.is_empty() {
                let mut pseudo_random_seed = env.ledger().timestamp();
                let winners_count = quest.max_winners.min(participants.len() as u32);
                
                let mut available_participants = participants.clone();
                
                for _ in 0..winners_count {
                    if available_participants.is_empty() { 
                        break; 
                    }
                    
                    let index = (pseudo_random_seed % available_participants.len() as u64) as u32;
                    winners.push_back(available_participants.get(index).unwrap());
                    available_participants.remove(index);
                    
                    // Atualiza a semente para o próximo sorteio
                    pseudo_random_seed = (pseudo_random_seed.wrapping_mul(1103515245).wrapping_add(12345)) / 65536;
                }
            }
            
            env.storage().persistent().set(&DataKey::Winners(quest_id), &winners);
        }
        
        // Desativa a quest
        let mut quest_to_update = quest;
        quest_to_update.is_active = false;
        env.storage().persistent().set(&DataKey::Quests(quest_id), &quest_to_update);

        let winners: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Winners(quest_id))
            .unwrap_or(Vec::new(&env));

        // Emit event
        env.events().publish((Symbol::new(&env, "quest_resolved"),), QuestResolvedEvent {
            quest_id,
            winners_count: winners.len() as u32,
        });
    }

    /// Distribui as recompensas para os ganhadores
    pub fn distribute_rewards(env: Env, quest_id: u64) {
        let quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));
        
        quest.admin.require_auth();

        if quest.is_active {
            panic_with_error!(&env, Error::QuestNotResolved);
        }

        let winners: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Winners(quest_id))
            .unwrap_or(Vec::new(&env));
        
        if winners.is_empty() {
            panic_with_error!(&env, Error::NoWinners);
        }

        let reward_token_client = token::Client::new(&env, &quest.reward_token);

        for winner in winners.iter() {
            // Para testes, vamos apenas simular a distribuição
            // reward_token_client.transfer(
            //     &env.current_contract_address(), 
            //     &winner, 
            //     &(quest.reward_per_winner as i128)
            // );
        }
    }

    // VIEW FUNCTIONS
    
    /// Obtém informações de uma quest específica
    pub fn get_quest(env: Env, quest_id: u64) -> Quest {
        env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound))
    }

    /// Obtém todas as quests ativas
    pub fn get_active_quests(env: Env) -> Vec<Quest> {
        let quest_ids: Vec<u64> = env.storage().persistent()
            .get(&DataKey::QuestIds)
            .unwrap_or(Vec::new(&env));
        
        let mut active_quests = Vec::new(&env);
        
        for quest_id in quest_ids.iter() {
            let quest: Quest = env.storage().persistent()
                .get(&DataKey::Quests(quest_id))
                .unwrap();
            
            if quest.is_active && env.ledger().timestamp() <= quest.end_timestamp {
                active_quests.push_back(quest);
            }
        }
        
        active_quests
    }

    /// Obtém os participantes de uma quest
    pub fn get_participants(env: Env, quest_id: u64) -> Vec<Address> {
        env.storage().persistent()
            .get(&DataKey::Participants(quest_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Obtém os ganhadores de uma quest
    pub fn get_winners(env: Env, quest_id: u64) -> Vec<Address> {
        env.storage().persistent()
            .get(&DataKey::Winners(quest_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Verifica se um usuário está registrado em uma quest
    pub fn is_user_registered(env: Env, quest_id: u64, user: Address) -> bool {
        env.storage().persistent().has(&DataKey::Registrations(quest_id, user))
    }

    /// Obtém as quests em que um usuário está participando
    pub fn get_user_quests(env: Env, user: Address) -> Vec<u64> {
        env.storage().persistent()
            .get(&DataKey::UserQuests(user))
            .unwrap_or(Vec::new(&env))
    }

    /// Obtém o contador atual de quests
    pub fn get_quest_counter(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::QuestCounter).unwrap_or(0)
    }

    /// Obtém estatísticas de uma quest
    pub fn get_quest_stats(env: Env, quest_id: u64) -> QuestStats {
        let quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));

        let participants: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Participants(quest_id))
            .unwrap_or(Vec::new(&env));

        let winners: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Winners(quest_id))
            .unwrap_or(Vec::new(&env));

        // Conta registrations manualmente (não há forma direta no Soroban)
        let total_registered = match quest.distribution {
            DistributionType::Raffle => participants.len() as u32,
            DistributionType::Fcfs => winners.len() as u32,
        };

        QuestStats {
            quest_id,
            total_registered,
            total_eligible: participants.len() as u32,
            total_winners: winners.len() as u32,
            is_resolved: !quest.is_active,
            time_remaining: if env.ledger().timestamp() < quest.end_timestamp {
                quest.end_timestamp - env.ledger().timestamp()
            } else {
                0
            },
        }
    }

    /// Obtém estatísticas de participação de um usuário
    pub fn get_user_stats(env: Env, user: Address) -> UserStats {
        StorageHelper::get_user_participation_stats(&env, &user)
    }

    /// Função administrativa para cancelar uma quest
    pub fn cancel_quest(env: Env, quest_id: u64) {
        let mut quest: Quest = env.storage().persistent()
            .get(&DataKey::Quests(quest_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::QuestNotFound));
        
        quest.admin.require_auth();

        if !quest.is_active {
            panic_with_error!(&env, Error::QuestNotActive);
        }

        // Desativa a quest
        quest.is_active = false;
        env.storage().persistent().set(&DataKey::Quests(quest_id), &quest);

        // Retorna os fundos para o admin (para testes, apenas simulado)
        // let reward_token_client = token::Client::new(&env, &quest.reward_token);
        // let balance = reward_token_client.balance(&env.current_contract_address());
        
        // if balance > 0 {
        //     reward_token_client.transfer(
        //         &env.current_contract_address(),
        //         &quest.admin,
        //         &balance
        //     );
        // }

        // Emit event
        env.events().publish((Symbol::new(&env, "quest_cancelled"),), quest_id);
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestStats {
    pub quest_id: u64,
    pub total_registered: u32,
    pub total_eligible: u32,
    pub total_winners: u32,
    pub is_resolved: bool,
    pub time_remaining: u64,
}
