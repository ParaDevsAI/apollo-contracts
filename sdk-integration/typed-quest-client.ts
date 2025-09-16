import { Client, Quest, DistributionType, QuestType } from '../contracts/quest-manager/bindings/src/index.js';

// Exemplo de uso dos bindings gerados
class QuestManagerClient {
  private client: Client;

  constructor(contractId: string, networkPassphrase: string) {
    this.client = new Client({
      contractId,
      networkPassphrase,
      rpcUrl: 'https://soroban-testnet.stellar.org:443'
    });
  }

  /**
   * Cria uma nova quest com tipos seguros
   */
  async createQuest(params: {
    admin: string;
    rewardToken: string;
    rewardPerWinner: number;
    maxWinners: number;
    distributionType: 'Raffle' | 'Fcfs';
    questType: 'TradeVolume' | 'PoolPosition' | 'TokenHold';
    questParams: number[];
    durationSeconds: number;
    rewardPoolAmount: number;
    title: string;
    description: string;
  }): Promise<number> {
    
    // Tipos TypeScript garantem que estamos passando os dados corretos
    const distribution: DistributionType = 
      params.distributionType === 'Raffle' 
        ? { tag: 'Raffle', values: void 0 }
        : { tag: 'Fcfs', values: void 0 };

    const questType: QuestType = (() => {
      switch (params.questType) {
        case 'TradeVolume':
          return { tag: 'TradeVolume', values: [params.questParams[0]] as const };
        case 'PoolPosition':
          return { tag: 'PoolPosition', values: [params.questParams[0]] as const };
        case 'TokenHold':
          return { tag: 'TokenHold', values: [params.rewardToken, params.questParams[0]] as const };
      }
    })();

    // Chamada tipada para o contrato
    const transaction = await this.client.create_quest({
      admin: params.admin,
      reward_token: params.rewardToken,
      reward_per_winner: params.rewardPerWinner,
      max_winners: params.maxWinners,
      distribution,
      quest_type: questType,
      duration_seconds: params.durationSeconds,
      reward_pool_amount: params.rewardPoolAmount,
      title: params.title,
      description: params.description
    });

    // O resultado é tipado como u64
    const result = await transaction.signAndSend();
    return Number(result.result);
  }

  /**
   * Lista quests ativas com tipos seguros
   */
  async getActiveQuests(): Promise<Quest[]> {
    const transaction = await this.client.get_active_quests();
    return transaction.result; // Tipado como Quest[]
  }

  /**
   * Registra usuário em uma quest
   */
  async registerUser(questId: number, userAddress: string): Promise<void> {
    const transaction = await this.client.register({
      quest_id: questId,
      user: userAddress
    });
    
    await transaction.signAndSend();
  }

  /**
   * Verifica se usuário está registrado
   */
  async isUserRegistered(questId: number, userAddress: string): Promise<boolean> {
    const transaction = await this.client.is_user_registered({
      quest_id: questId,
      user: userAddress
    });
    
    return transaction.result; // Tipado como boolean
  }
}

// Exemplo de uso
async function example() {
  const questManager = new QuestManagerClient(
    'CDCLZROJYSA74I3N2QEGEW4XEWIY4KRZWHJJNIF2CEMEYCSM4H5CNCXD',
    'Test SDF Network ; September 2015'
  );

  // TypeScript auto-complete e type checking
  const questId = await questManager.createQuest({
    admin: 'GCJDWHAZX4LGH72KKFAG6WHXVOAOQDRAF54J6JKRVDVY5OXLVCWN6OES',
    rewardToken: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    rewardPerWinner: 1000000,
    maxWinners: 5,
    distributionType: 'Raffle',
    questType: 'TradeVolume',
    questParams: [5000000],
    durationSeconds: 3600,
    rewardPoolAmount: 5000000,
    title: 'TypeScript Quest',
    description: 'Quest criada via bindings TypeScript!'
  });

  console.log('Quest criada:', questId);

  // Listar quests com tipos seguros
  const quests = await questManager.getActiveQuests();
  quests.forEach(quest => {
    // TypeScript sabe que quest.id é u64, quest.title é string, etc.
    console.log(`Quest ${quest.id}: ${quest.title}`);
  });
}

export { QuestManagerClient };
export default QuestManagerClient;
