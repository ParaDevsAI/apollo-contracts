import { 
  SorobanRpc, 
  Networks, 
  Keypair, 
  TransactionBuilder, 
  Operation,
  Contract,
  Address,
  xdr,
  scValToNative
} from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

class QuestManagerSDK {
  constructor(options = {}) {
    this.networkPassphrase = options.networkPassphrase || process.env.STELLAR_NETWORK_PASSPHRASE;
    this.rpcUrl = options.rpcUrl || process.env.STELLAR_RPC_URL;
    this.contractId = options.contractId || process.env.QUEST_MANAGER_CONTRACT_ID;
    
    this.server = new SorobanRpc.Server(this.rpcUrl);
    this.contract = new Contract(this.contractId);
  }

  /**
   * Helper para criar keypair a partir de secret key
   */
  getKeypair(secretKey) {
    return Keypair.fromSecret(secretKey);
  }

  /**
   * Helper para simular uma transação read-only
   */
  async simulateReadOnlyCall(functionName, args = []) {
    try {
      const operation = this.contract.call(functionName, ...args);
      
      // Usar uma conta dummy para simulação
      const sourceAccount = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      const result = await this.server.simulateTransaction(transaction);
      
      console.log('🔍 Resultado simulação:', result);
      
      if (result.result && result.result.retval) {
        // O valor está em result.retval, que já é um ScVal
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
      console.error('❌ Erro na simulação:', error);
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
    return this.simulateReadOnlyCall('get_quest', [questId]);
  }

  /**
   * Lista quests ativas
   */
  async getActiveQuests() {
    return this.simulateReadOnlyCall('get_active_quests');
  }
}

export default QuestManagerSDK;
