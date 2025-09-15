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

export class QuestManagerSDK {
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
   * Helper para obter account do servidor
   */
  async getAccount(keypair) {
    return await this.server.getAccount(keypair.publicKey());
  }

  /**
   * Helper para construir e assinar transação
   */
  async buildAndSignTransaction(operation, signerKeypair) {
    const account = await this.getAccount(signerKeypair);
    
    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    transaction.sign(signerKeypair);
    return transaction;
  }

  /**
   * Helper para submeter transação
   */
  async submitTransaction(transaction) {
    const result = await this.server.sendTransaction(transaction);
    
    if (result.status === 'PENDING') {
      // Aguarda confirmação
      let txResult;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        txResult = await this.server.getTransaction(result.hash);
      } while (txResult.status === 'NOT_FOUND');
      
      return txResult;
    }
    
    return result;
  }

  /**
   * Cria uma nova quest
   */
  async createQuest({
    adminSecretKey,
    rewardToken,
    rewardPerWinner,
    maxWinners,
    distribution, // 'Raffle' ou 'Fcfs'
    questType, // { type: 'TradeVolume', params: [amount] }
    durationSeconds,
    rewardPoolAmount,
    title,
    description
  }) {
    const adminKeypair = this.getKeypair(adminSecretKey);
    
    // Construir os parâmetros corretos para o Soroban
    const distributionParam = distribution === 'Raffle' ? 
      xdr.ScVal.scvInstance(xdr.ScInstanceType.scInstanceTypeContract()) : // Placeholder - ajustar conforme necessário
      xdr.ScVal.scvInstance(xdr.ScInstanceType.scInstanceTypeContract());

    const questTypeParam = this.buildQuestTypeParam(questType);

    const operation = this.contract.call(
      'create_quest',
      Address.fromString(adminKeypair.publicKey()),
      Address.fromString(rewardToken),
      rewardPerWinner,
      maxWinners,
      distributionParam,
      questTypeParam,
      durationSeconds,
      rewardPoolAmount,
      title,
      description
    );

    const transaction = await this.buildAndSignTransaction(operation, adminKeypair);
    const result = await this.submitTransaction(transaction);

    return this.parseTransactionResult(result);
  }

  /**
   * Helper para construir QuestType parameter
   */
  buildQuestTypeParam(questType) {
    switch (questType.type) {
      case 'TradeVolume':
        return xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('TradeVolume'),
          xdr.ScVal.scvU128(xdr.UInt128.fromString(questType.params[0].toString()))
        ]);
      case 'PoolPosition':
        return xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('PoolPosition'),
          xdr.ScVal.scvU128(xdr.UInt128.fromString(questType.params[0].toString()))
        ]);
      case 'TokenHold':
        return xdr.ScVal.scvVec([
          xdr.ScVal.scvSymbol('TokenHold'),
          Address.fromString(questType.params[0]),
          xdr.ScVal.scvU128(xdr.UInt128.fromString(questType.params[1].toString()))
        ]);
      default:
        throw new Error(`Unsupported quest type: ${questType.type}`);
    }
  }

  /**
   * Registra um usuário em uma quest
   */
  async register(questId, userSecretKey) {
    const userKeypair = this.getKeypair(userSecretKey);

    const operation = this.contract.call(
      'register',
      questId,
      Address.fromString(userKeypair.publicKey())
    );

    const transaction = await this.buildAndSignTransaction(operation, userKeypair);
    const result = await this.submitTransaction(transaction);

    return this.parseTransactionResult(result);
  }

  /**
   * Marca um usuário como elegível (apenas admin)
   */
  async markUserEligible(questId, userAddress, adminSecretKey) {
    const adminKeypair = this.getKeypair(adminSecretKey);

    const operation = this.contract.call(
      'mark_user_eligible',
      questId,
      Address.fromString(userAddress)
    );

    const transaction = await this.buildAndSignTransaction(operation, adminKeypair);
    const result = await this.submitTransaction(transaction);

    return this.parseTransactionResult(result);
  }

  /**
   * Resolve uma quest (apenas admin)
   */
  async resolveQuest(questId, adminSecretKey) {
    const adminKeypair = this.getKeypair(adminSecretKey);

    const operation = this.contract.call('resolve_quest', questId);
    const transaction = await this.buildAndSignTransaction(operation, adminKeypair);
    const result = await this.submitTransaction(transaction);

    return this.parseTransactionResult(result);
  }

  /**
   * Distribui recompensas (apenas admin)
   */
  async distributeRewards(questId, adminSecretKey) {
    const adminKeypair = this.getKeypair(adminSecretKey);

    const operation = this.contract.call('distribute_rewards', questId);
    const transaction = await this.buildAndSignTransaction(operation, adminKeypair);
    const result = await this.submitTransaction(transaction);

    return this.parseTransactionResult(result);
  }

  /**
   * Obtém informações de uma quest
   */
  async getQuest(questId) {
    const operation = this.contract.call('get_quest', questId);
    
    // Para read-only operations, podemos simular
    const account = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    const result = await this.server.simulateTransaction(transaction);
    return this.parseSimulationResult(result);
  }

  /**
   * Obtém todas as quests ativas
   */
  async getActiveQuests() {
    const operation = this.contract.call('get_active_quests');
    
    const account = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    const result = await this.server.simulateTransaction(transaction);
    return this.parseSimulationResult(result);
  }

  /**
   * Obtém ganhadores de uma quest
   */
  async getWinners(questId) {
    const operation = this.contract.call('get_winners', questId);
    
    const account = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    const result = await this.server.simulateTransaction(transaction);
    return this.parseSimulationResult(result);
  }

  /**
   * Obtém contador de quests
   */
  async getQuestCounter() {
    const operation = this.contract.call('get_quest_counter');
    
    const account = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase
    })
    .addOperation(operation)
    .setTimeout(30)
    .build();

    const result = await this.server.simulateTransaction(transaction);
    return this.parseSimulationResult(result);
  }

  /**
   * Helper para parsear resultado de transação
   */
  parseTransactionResult(result) {
    if (result.status === 'SUCCESS') {
      return {
        success: true,
        data: result.returnValue,
        hash: result.hash
      };
    } else {
      return {
        success: false,
        error: result.resultXdr || result.status,
        hash: result.hash
      };
    }
  }

  /**
   * Helper para parsear resultado de simulação
   */
  parseSimulationResult(result) {
    if (result.result && result.result.retval) {
      const nativeValue = scValToNative(result.result.retval);
      
      return {
        success: true,
        data: nativeValue
      };
    } else {
      return {
        success: false,
        error: result.error || 'No result'
      };
    }
  }
}

export default QuestManagerSDK;
