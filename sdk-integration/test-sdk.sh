#!/bin/bash

# Script para testar todas as funcionalidades do SDK Quest Manager

echo "🚀 Iniciando testes do SDK Quest Manager..."
echo "============================================="

cd /home/f0ntz/Documents/APOLO-CONTRACTS/apollo-contracts/sdk-integration

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "1️⃣ Verificando contador de quests..."
node examples/list-quests.js

echo ""
echo "2️⃣ Criando uma nova quest FCFS de Trade Volume..."
node examples/create-quest.js

echo ""
echo "3️⃣ Listando quests novamente..."
node examples/list-quests.js

echo ""
echo "4️⃣ Registrando usuário na quest 0..."
node examples/register.js 0

echo ""
echo "✅ Testes básicos concluídos!"
echo ""
echo "💡 Para testes avançados, use:"
echo "   - mark-eligible.js [QUEST_ID] [USER_ADDRESS]"
echo "   - resolve-quest.js [QUEST_ID]" 
echo "   - distribute-rewards.js [QUEST_ID]"
