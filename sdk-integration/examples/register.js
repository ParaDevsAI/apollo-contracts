import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  // ⚠️ Configure seu .env com as chaves do usuário
  const userSecretKey = process.env.USER1_SECRET_KEY;
  const questId = process.argv[2] || 0; // Quest ID via argumento

  if (!userSecretKey) {
    console.error('❌ USER1_SECRET_KEY não configurado no .env');
    return;
  }

  try {
    console.log(`🎯 Registrando usuário na quest ${questId}...`);
    
    const result = await sdk.register(questId, userSecretKey);
    
    if (result.success) {
      console.log('✅ Usuário registrado com sucesso!');
      console.log('📄 Hash da transação:', result.hash);
    } else {
      console.log('❌ Erro ao registrar usuário:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

console.log('💡 Uso: node examples/register.js [QUEST_ID]');
main().catch(console.error);
