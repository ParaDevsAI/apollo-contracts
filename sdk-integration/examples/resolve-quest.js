import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  const adminSecretKey = process.env.ADMIN_SECRET_KEY;
  const questId = process.argv[2] || 0;

  if (!adminSecretKey) {
    console.log('💡 Uso: node examples/resolve-quest.js [QUEST_ID]');
    return;
  }

  try {
    console.log(`🎯 Resolvendo quest ${questId}...`);
    
    const result = await sdk.resolveQuest(questId, adminSecretKey);
    
    if (result.success) {
      console.log('✅ Quest resolvida com sucesso!');
      console.log('📄 Hash da transação:', result.hash);
    } else {
      console.log('❌ Erro:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main().catch(console.error);
