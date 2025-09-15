import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  const adminSecretKey = process.env.ADMIN_SECRET_KEY;
  const questId = process.argv[2] || 0;

  if (!adminSecretKey) {
    console.log('💡 Uso: node examples/distribute-rewards.js [QUEST_ID]');
    return;
  }

  try {
    console.log(`🎯 Distribuindo recompensas da quest ${questId}...`);
    
    const result = await sdk.distributeRewards(questId, adminSecretKey);
    
    if (result.success) {
      console.log('✅ Recompensas distribuídas com sucesso!');
      console.log('📄 Hash da transação:', result.hash);
    } else {
      console.log('❌ Erro:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main().catch(console.error);
