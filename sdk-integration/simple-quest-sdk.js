import { 
  SorobanRpc, 
  Keypair, 
  TransactionBuilder, 
  Contract,
  Address,
  scValToNative,
  nativeToScVal
} from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

class QuestManagerSDK {
  constructor() {
    this.networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE;
    this.rpcUrl = process.env.STELLAR_RPC_URL;
    this.contractId = process.env.QUEST_MANAGER_CONTRACT_ID;
    
    this.server = new SorobanRpc.Server(this.rpcUrl);
    this.contract = new Contract(this.contractId);
  }

  /**
   * Helper para simular uma transação read-only
   */
  async simulateReadOnlyCall(functionName, args = []) {
    try {
      const operation = this.contract.call(functionName, ...args);
      
      const sourceAccount = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      const result = await this.server.simulateTransaction(transaction);
      
      if (result.result && result.result.retval) {
        const nativeValue = scValToNative(result.result.retval);
        return {
          success: true,
          data: nativeValue
        };
      } else {
        return {
          success: false,
          error: result.error || 'No result returned'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper para submeter uma transação
   */
  async submitTransaction(functionName, args, secretKey) {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      const operation = this.contract.call(functionName, ...args);
      
      const sourceAccount = await this.server.getAccount(keypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      transaction.sign(keypair);

      const result = await this.server.sendTransaction(transaction);
      
      if (result.status === 'PENDING') {
        // Aguarda confirmação
        let txResult;
        do {
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            txResult = await this.server.getTransaction(result.hash);
          } catch (e) {
            // Continua tentando
          }
        } while (!txResult || txResult.status === 'NOT_FOUND');
        
        return {
          success: txResult.status === 'SUCCESS',
          hash: result.hash,
          error: txResult.status !== 'SUCCESS' ? txResult.resultXdr : null
        };
      }
      
      return {
        success: result.status === 'SUCCESS',
        hash: result.hash,
        error: result.status !== 'SUCCESS' ? result.errorResultXdr : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém o contador de quests
   */
  async getQuestCounter() {
    return this.simulateReadOnlyCall('get_quest_counter');
  }

  /**
   * Obtém informações de uma quest
   */
  async getQuest(questId) {
    return this.simulateReadOnlyCall('get_quest', [nativeToScVal(questId, {type: "u64"})]);
  }

  /**
   * Lista quests ativas
   */
  async getActiveQuests() {
    return this.simulateReadOnlyCall('get_active_quests');
  }

  /**
   * Cria uma nova quest (versão simplificada)
   */
  async createQuest({
    adminSecretKey,
    rewardToken,
    rewardPerWinner,
    maxWinners,
    distribution,
    questType,
    durationSeconds,
    rewardPoolAmount,
    title,
    description
  }) {
    console.log('⚠️  Para criar quests, use o CLI do Stellar devido à complexidade dos tipos enum.');
    console.log('📝 Comando sugerido:');
    
    const adminKeypair = Keypair.fromSecret(adminSecretKey);
    
    console.log(`stellar contract invoke \\
  --id ${this.contractId} \\
  --source ${adminSecretKey} \\
  --network testnet \\
  -- create_quest \\
  --admin ${adminKeypair.publicKey()} \\
  --reward_token ${rewardToken} \\
  --reward_per_winner ${rewardPerWinner} \\
  --max_winners ${maxWinners} \\
  --distribution '{"Raffle": {}}' \\
  --quest_type '{"TradeVolume": ${questType.params[0]}}' \\
  --duration_seconds ${durationSeconds} \\
  --reward_pool_amount ${rewardPoolAmount} \\
  --title "${title}" \\
  --description "${description}"`);

    return {
      success: false,
      error: 'Use o CLI para criar quests - ver comando acima'
    };
  }

  /**
   * Registra um usuário em uma quest
   */
  async register(questId, userSecretKey) {
    const userKeypair = Keypair.fromSecret(userSecretKey);
    
    return this.submitTransaction(
      'register',
      [
        nativeToScVal(questId, {type: "u64"}),
        nativeToScVal(userKeypair.publicKey(), {type: "address"})
      ],
      userSecretKey
    );
  }

  /**
   * Marca um usuário como elegível (apenas admin)
   */
  async markUserEligible(questId, userAddress, adminSecretKey) {
    return this.submitTransaction(
      'mark_user_eligible',
      [
        nativeToScVal(questId, {type: "u64"}),
        nativeToScVal(userAddress, {type: "address"})
      ],
      adminSecretKey
    );
  }

  /**
   * Resolve uma quest (apenas admin)
   */
  async resolveQuest(questId, adminSecretKey) {
    return this.submitTransaction(
      'resolve_quest',
      [nativeToScVal(questId, {type: "u64"})],
      adminSecretKey
    );
  }

  /**
   * Distribui recompensas (apenas admin)
   */
  async distributeRewards(questId, adminSecretKey) {
    return this.submitTransaction(
      'distribute_rewards',
      [nativeToScVal(questId, {type: "u64"})],
      adminSecretKey
    );
  }
}

export default QuestManagerSDK;
