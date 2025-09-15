use soroban_sdk::{contracttype, Env, Address, Vec};
use crate::{DataKey, Quest};

// Funções utilitárias para gerenciamento de storage
pub struct StorageHelper;

impl StorageHelper {
    /// Obtém todos os IDs de quest
    pub fn get_all_quest_ids(env: &Env) -> Vec<u64> {
        env.storage().persistent()
            .get(&DataKey::QuestIds)
            .unwrap_or(Vec::new(env))
    }

    /// Adiciona um ID de quest à lista global
    pub fn add_quest_id(env: &Env, quest_id: u64) {
        let mut quest_ids = Self::get_all_quest_ids(env);
        quest_ids.push_back(quest_id);
        env.storage().persistent().set(&DataKey::QuestIds, &quest_ids);
    }

    /// Remove um ID de quest da lista global
    pub fn remove_quest_id(env: &Env, quest_id: u64) {
        let mut quest_ids = Self::get_all_quest_ids(env);
        if let Some(index) = quest_ids.iter().position(|id| id == quest_id) {
            quest_ids.remove(index as u32);
            env.storage().persistent().set(&DataKey::QuestIds, &quest_ids);
        }
    }

    /// Obtém quests por status
    pub fn get_quests_by_status(env: &Env, active_only: bool) -> Vec<Quest> {
        let quest_ids = Self::get_all_quest_ids(env);
        let mut filtered_quests = Vec::new(env);
        let current_time = env.ledger().timestamp();

        for quest_id in quest_ids.iter() {
            if let Some(quest) = env.storage().persistent().get::<DataKey, Quest>(&DataKey::Quests(quest_id)) {
                let is_active = quest.is_active && current_time <= quest.end_timestamp;
                
                if active_only && is_active {
                    filtered_quests.push_back(quest);
                } else if !active_only && !is_active {
                    filtered_quests.push_back(quest);
                }
            }
        }

        filtered_quests
    }

    /// Verifica se um usuário é elegível para uma quest baseado nas configurações
    pub fn is_user_eligible(env: &Env, user: &Address, quest_id: u64) -> bool {
        // Verifica se está registrado
        if !env.storage().persistent().has(&DataKey::Registrations(quest_id, user.clone())) {
            return false;
        }

        // Aqui você pode adicionar mais validações baseadas nas configurações da quest
        // Por exemplo, verificar KYC, idade da conta, etc.
        
        true
    }

    /// Obtém estatísticas de participação de um usuário
    pub fn get_user_participation_stats(env: &Env, user: &Address) -> UserStats {
        let user_quests: Vec<u64> = env.storage().persistent()
            .get(&DataKey::UserQuests(user.clone()))
            .unwrap_or(Vec::new(env));

        let mut total_participated = 0u32;
        let mut total_won = 0u32;
        let mut total_rewards = 0u128;

        for quest_id in user_quests.iter() {
            total_participated += 1;

            let winners: Vec<Address> = env.storage().persistent()
                .get(&DataKey::Winners(quest_id))
                .unwrap_or(Vec::new(env));

            if winners.contains(user) {
                total_won += 1;
                
                if let Some(quest) = env.storage().persistent().get::<DataKey, Quest>(&DataKey::Quests(quest_id)) {
                    total_rewards += quest.reward_per_winner;
                }
            }
        }

        UserStats {
            total_participated,
            total_won,
            total_rewards,
            win_rate: if total_participated > 0 {
                (total_won as u128 * 10000) / total_participated as u128 // Percentual * 100 para evitar decimais
            } else {
                0
            },
        }
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserStats {
    pub total_participated: u32,
    pub total_won: u32,
    pub total_rewards: u128,
    pub win_rate: u128, // Percentual * 100 (ex: 2500 = 25%)
}
