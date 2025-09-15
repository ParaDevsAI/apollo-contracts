#!/bin/bash

# Build script para o QuestManager Smart Contract

set -e

echo "🔨 Building QuestManager Smart Contract..."

# Verifica se o Rust está instalado
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo não está instalado. Instale em https://rustup.rs/"
    exit 1
fi

# Verifica se o target wasm32 está instalado
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    echo "📦 Instalando target wasm32-unknown-unknown..."
    rustup target add wasm32-unknown-unknown
fi

# Build do contrato
echo "🏗️  Compilando contrato..."
cargo build --target wasm32-unknown-unknown --release

# Verifica se o Soroban CLI está instalado
if command -v soroban &> /dev/null; then
    echo "⚡ Otimizando WASM..."
    soroban contract optimize \
        --wasm target/wasm32-unknown-unknown/release/quest_manager.wasm
    
    echo "✅ Build concluído!"
    echo "📁 WASM otimizado: target/wasm32-unknown-unknown/release/quest_manager.optimized.wasm"
else
    echo "⚠️  Soroban CLI não encontrado. WASM não foi otimizado."
    echo "✅ Build concluído!"
    echo "📁 WASM: target/wasm32-unknown-unknown/release/quest_manager.wasm"
fi

# Executa testes
echo "🧪 Executando testes..."
cargo test

echo "🎉 Todos os testes passaram!"

# Informações finais
echo ""
echo "📋 Próximos passos:"
echo "1. Deploy: soroban contract deploy --wasm <arquivo.wasm> --source <conta> --network testnet"
echo "2. Invoke: soroban contract invoke --id <contract-id> --source <conta> --network testnet -- <function> <args>"
echo ""
echo "📚 Documentação completa no README.md"
