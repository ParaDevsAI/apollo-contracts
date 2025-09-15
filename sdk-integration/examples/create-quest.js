import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  // ⚠️ IMPORTANTE: Configure seu .env com as chaves corretas!
  const adminSecretKey = process.env.ADMIN_SECRET_KEY;
  const rewardToken = process.env.REWARD_TOKEN_ADDRESS;

  if (!adminSecretKey) {
    console.error('❌ ADMIN_SECRET_KEY não configurado no .env');
    return;
  }

  try {
    console.log('🚀 Criando nova quest...');
    
    const questParams = {
      adminSecretKey: adminSecretKey,
      rewardToken: rewardToken,
      rewardPerWinner: 1000000, // 1 token (6 decimais)
      maxWinners: 5,
      distribution: 'Raffle', // ou 'Fcfs'
      questType: {
        type: 'TradeVolume',
        params: [10000000] // 10 tokens de volume
      },
      durationSeconds: 7 * 24 * 60 * 60, // 7 dias
      rewardPoolAmount: 5000000, // 5 tokens
      title: 'Weekly Volume Challenge',
      description: 'Trade 10 tokens worth of volume to be eligible for rewards!'
    };

    console.log('📋 Parâmetros da quest:');
    console.log(JSON.stringify(questParams, null, 2));

    const result = await sdk.createQuest(questParams);
    
    if (result.success) {
      console.log('✅ Quest criada com sucesso!');
      console.log('📄 Hash da transação:', result.hash);
      console.log('📊 Dados de retorno:', result.data);
    } else {
      console.log('❌ Erro ao criar quest:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);
