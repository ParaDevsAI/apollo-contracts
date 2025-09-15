import QuestManagerSDK from './quest-manager-sdk.js';

async function debugSDK() {
  const sdk = new QuestManagerSDK();
  
  console.log('🔍 Debug: Testando conexão com contrato...');
  
  // Vamos fazer uma chamada direta para debug
  const operation = sdk.contract.call('get_quest_counter');
  
  const account = await sdk.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
  const transaction = new sdk.StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: sdk.networkPassphrase
  })
  .addOperation(operation)
  .setTimeout(30)
  .build();

  console.log('🔍 Simulando transação...');
  const result = await sdk.server.simulateTransaction(transaction);
  
  console.log('📊 Resultado bruto:', JSON.stringify(result, null, 2));
  
  // Vamos tentar diferentes formas de acessar o resultado
  if (result.results && result.results.length > 0) {
    console.log('📊 result.results[0]:', result.results[0]);
    if (result.results[0].xdr) {
      const val = sdk.StellarSdk.scValToNative(sdk.StellarSdk.xdr.ScVal.fromXDR(result.results[0].xdr, 'base64'));
      console.log('📊 Valor decodificado:', val);
    }
  }
}

debugSDK().catch(console.error);
