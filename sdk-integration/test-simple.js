import QuestManagerSDK from './simple-sdk.js';

async function testSimpleSDK() {
  console.log('🚀 Testando SDK simplificado...');
  
  const sdk = new QuestManagerSDK();
  
  console.log('📊 Configuração:');
  console.log('- RPC URL:', sdk.rpcUrl);
  console.log('- Contract ID:', sdk.contractId);
  console.log('- Network:', sdk.networkPassphrase);
  
  console.log('\n🔍 Testando get_quest_counter...');
  const counter = await sdk.getQuestCounter();
  console.log('Resultado:', counter);
  
  console.log('\n🔍 Testando get_active_quests...');
  const activeQuests = await sdk.getActiveQuests();
  console.log('Resultado:', activeQuests);
}

testSimpleSDK().catch(console.error);
