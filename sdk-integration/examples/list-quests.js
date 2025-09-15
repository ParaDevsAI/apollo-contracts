import QuestManagerSDK from '../quest-manager-sdk.js';

async function main() {
  const sdk = new QuestManagerSDK();

  try {
    console.log('🔍 Consultando contador de quests...');
    const counter = await sdk.getQuestCounter();
    console.log('Quest Counter:', counter);

    console.log('\n📋 Buscando quests ativas...');
    const activeQuests = await sdk.getActiveQuests();
    console.log('Active Quests:', activeQuests);

    if (activeQuests.success && activeQuests.data && activeQuests.data.length > 0) {
      console.log('\n🎯 Detalhes da primeira quest:');
      const questDetails = await sdk.getQuest(0);
      console.log('Quest Details:', questDetails);

      console.log('\n🏆 Verificando ganhadores da quest 0:');
      const winners = await sdk.getWinners(0);
      console.log('Winners:', winners);
    } else {
      console.log('\n❌ Nenhuma quest ativa encontrada. Use create-quest.js para criar uma!');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main().catch(console.error);
