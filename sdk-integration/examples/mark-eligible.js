import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  const adminSecretKey = process.env.ADMIN_SECRET_KEY;
  const questId = process.argv[2] || 0;
  const userAddress = process.argv[3];

  if (!adminSecretKey || !userAddress) {
    console.log('💡 Uso: node examples/mark-eligible.js [QUEST_ID] [USER_ADDRESS]');
    return;
  }

  try {
    console.log(`🎯 Marcando usuário ${userAddress} como elegível na quest ${questId}...`);
    
    const result = await sdk.markUserEligible(questId, userAddress, adminSecretKey);
    
    if (result.success) {
      console.log('✅ Usuário marcado como elegível!');
      console.log('📄 Hash da transação:', result.hash);
    } else {
      console.log('❌ Erro:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main().catch(console.error);
