// AI Signal Bot Simulation

const cryptoPairs = [
    'BTC/USDT',
    'ETH/USDT',
    'BNB/USDT',
    'SOL/USDT',
    'XRP/USDT',
    'DOGE/USDT',
    'ADA/USDT',
    'AVAX/USDT'
];

function generateRandomPrice(min, max) {
    return (Math.random() * (max - min) + min);
}

function generateSignal() {
    const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
    const action = Math.random() > 0.5 ? 'PIRKTI' : 'PARDUOTI';

    // Simulate some realistic price ranges
    let basePrice;
    if (pair.startsWith('BTC')) basePrice = generateRandomPrice(60000, 70000);
    else if (pair.startsWith('ETH')) basePrice = generateRandomPrice(3000, 4000);
    else if (pair.startsWith('BNB')) basePrice = generateRandomPrice(500, 700);
    else if (pair.startsWith('SOL')) basePrice = generateRandomPrice(150, 200);
    else basePrice = generateRandomPrice(1, 100);

    const entryPrice = parseFloat(basePrice.toFixed(2));

    let takeProfit, stopLoss;
    const riskRewardRatio = 1.5; // Example ratio

    if (action === 'PIRKTI') {
        const profitMargin = entryPrice * (generateRandomPrice(0.02, 0.05)); // 2-5% profit
        const lossMargin = profitMargin / riskRewardRatio;
        takeProfit = parseFloat((entryPrice + profitMargin).toFixed(2));
        stopLoss = parseFloat((entryPrice - lossMargin).toFixed(2));
    } else { // PARDUOTI
        const profitMargin = entryPrice * (generateRandomPrice(0.02, 0.05)); // 2-5% profit
        const lossMargin = profitMargin / riskRewardRatio;
        takeProfit = parseFloat((entryPrice - profitMargin).toFixed(2));
        stopLoss = parseFloat((entryPrice + profitMargin).toFixed(2));
    }

    return {
        action: action,
        pair: pair,
        entryPrice: entryPrice,
        takeProfit: takeProfit,
        stopLoss: stopLoss,
        timestamp: new Date()
    };
}

export { generateSignal };
