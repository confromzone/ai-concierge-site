import { generateSignal } from './bot.js';

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.querySelector('.chat-messages');

    function createMessageElement(signal) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', 'bot-message');

        const timestamp = signal.timestamp.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });

        messageEl.innerHTML = `
            <img src="images/bot-avatar.svg" alt="Bot" class="avatar">
            <div class="message-content">
                <span class="username">AI Botas <span class="timestamp">${timestamp}</span></span>
                <div class="text">
                    <strong>${signal.action}:</strong> ${signal.pair}<br>
                    <strong>Kaina:</strong> ${signal.entryPrice}<br>
                    <strong>Take Profit:</strong> ${signal.takeProfit}<br>
                    <strong>Stop Loss:</strong> ${signal.stopLoss}
                </div>
            </div>
        `;
        return messageEl;
    }

    function addSignalToChat() {
        const newSignal = generateSignal();
        const messageElement = createMessageElement(newSignal);
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    }

    // Add a new signal every 15 seconds
    setInterval(addSignalToChat, 15000);
});
