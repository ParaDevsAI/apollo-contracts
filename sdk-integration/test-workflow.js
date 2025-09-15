import QuestManagerSDK from './simple-quest-sdk.js';

async function testSimpleWorkflow() {
  console.log('🚀 Testando workflow completo do SDK...');
  
  const sdk = new QuestManagerSDK();
  
  // 1. Verificar contador inicial
  console.log('\n1️⃣ Verificando contador de quests...');
  const counter = await sdk.getQuestCounter();
  console.log('Quest Counter:', counter);
  
  // 2. Listar quests ativas
  console.log('\n2️⃣ Listando quests ativas...');
  const activeQuests = await sdk.getActiveQuests();
  console.log('Active Quests:', activeQuests);
  
  // 3. Mostrar como criar uma quest
  console.log('\n3️⃣ Como criar uma quest:');
  const createResult = await sdk.createQuest({
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
    rewardToken: 'GDOIXDCMHEQWTXVMAOUKIKTOBM5TS5F5RVRCGZS6GPNAQZIOCBHMVS2P',
    rewardPerWinner: 1000000,
    maxWinners: 5,
    distribution: 'Raffle',
    questType: { type: 'TradeVolume', params: [10000000] },
    durationSeconds: 604800,
    rewardPoolAmount: 5000000,
    title: 'Weekly Volume Challenge',
    description: 'Trade 10 tokens worth of volume to be eligible for rewards!'
  });
  
  // 4. Se houver quests, testar registro
  if (counter.success && counter.data > 0) {
    console.log('\n4️⃣ Testando registro na quest 0...');
    const registerResult = await sdk.register(0, process.env.ADMIN_SECRET_KEY);
    console.log('Register Result:', registerResult);
  }
}

testSimpleWorkflow().catch(console.error);
