#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_create_quest() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let reward_token = Address::generate(&env);
    let contract_id = env.register_contract(None, QuestManager);

    let client = QuestManagerClient::new(&env, &contract_id);

    let quest_id = client.create_quest(
        &admin,
        &reward_token,
        &1000u128, // reward_per_winner
        &5u32,     // max_winners
        &DistributionType::Raffle,
        &QuestType::TradeVolume(10000u128),
        &3600u64,  // duration_seconds (1 hora)
        &5000u128, // reward_pool_amount
        &String::from_str(&env, "Test Quest"),
        &String::from_str(&env, "A test quest for volume trading"),
    );

    assert_eq!(quest_id, 0);

    // Verifica se a quest foi criada corretamente
    let quest = client.get_quest(&quest_id);
    assert_eq!(quest.admin, admin);
    assert_eq!(quest.reward_per_winner, 1000u128);
    assert_eq!(quest.max_winners, 5u32);
    assert_eq!(quest.is_active, true);
}

#[test]
fn test_user_registration() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let reward_token = Address::generate(&env);
    let contract_id = env.register_contract(None, QuestManager);

    let client = QuestManagerClient::new(&env, &contract_id);

    // Cria uma quest
    let quest_id = client.create_quest(
        &admin,
        &reward_token,
        &1000u128,
        &5u32,
        &DistributionType::Raffle,
        &QuestType::TradeVolume(10000u128),
        &3600u64,
        &5000u128,
        &String::from_str(&env, "Test Quest"),
        &String::from_str(&env, "A test quest"),
    );

    // Usuário se registra
    client.register(&quest_id, &user);

    // Verifica se o usuário está registrado
    let is_registered = client.is_user_registered(&quest_id, &user);
    assert_eq!(is_registered, true);

    // Verifica se a quest aparece na lista do usuário
    let user_quests = client.get_user_quests(&user);
    assert_eq!(user_quests.len(), 1);
    assert_eq!(user_quests.get(0).unwrap(), quest_id);
}
