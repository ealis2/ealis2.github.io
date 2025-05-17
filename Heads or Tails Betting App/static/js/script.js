let selectedChoice = null;
let selectedToken = null;

function openLogoutModal() {
    document.getElementById('logout-modal').classList.add('modal-open');
}

function closeLogoutModal() {
    document.getElementById('logout-modal').classList.remove('modal-open');
}

function selectChoice(choice) {
    selectedChoice = choice;
    const blackToken = document.getElementById('black-token');
    const whiteToken = document.getElementById('white-token');
    const coinSelectionText = document.getElementById('coin-selection-text');
    const selectedSideInput = document.getElementById('selected-side');
    const tokenContainer = document.querySelector('.flex.justify-center.items-center.mb-8');
    const coinContainer = document.getElementById('coin-container');
    
    // Remove highlight from all tokens
    blackToken.classList.remove('ring-4', 'ring-primary');
    whiteToken.classList.remove('ring-4', 'ring-primary');
    
    // Highlight selected token
    if (choice === 'black') {
        blackToken.classList.add('ring-4', 'ring-primary');
    } else {
        whiteToken.classList.add('ring-4', 'ring-primary');
    }
    
    // Update selection text
    coinSelectionText.textContent = `You chose ${choice} token`;
    selectedSideInput.value = choice;
    
    // Hide token selection, show coin container
    tokenContainer.classList.add('hidden');
    coinContainer.classList.remove('hidden');
    
    validateBet();
}

function validateBet() {
    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    const placeButton = document.getElementById('place-bet-btn');
    
    placeButton.disabled = !selectedChoice || !betAmount || betAmount <= 0;
}

function animateCoinToss() {
    const coin = document.getElementById('coin');
    const coinContainer = document.getElementById('coin-container');
    
    // Add spinning animation
    coin.style.animation = 'spin 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) infinite';
    
    // Remove spinning after bet placement
    setTimeout(() => {
        coin.style.animation = 'none';
    }, 1500);
}

async function placeBet() {
    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    
    // Trigger coin toss animation
    animateCoinToss();
    
    try {
        const response = await fetch('/place_bet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                choice: selectedChoice,
                amount: betAmount
            })
        });
        
        const result = await response.json();
        
        // Show result modal
        const modal = document.getElementById('result-modal');
        const titleEl = document.getElementById('result-title');
        const messageEl = document.getElementById('result-message');
        const coin = document.getElementById('coin');
        
        // Reveal final coin side after animation
        setTimeout(() => {
            coin.style.transform = result.result === 'black' ? 'rotateY(0deg)' : 'rotateY(180deg)';
            
            titleEl.textContent = result.won ? 'You Won!' : 'You Lost';
            messageEl.textContent = `The coin landed on ${result.result}. ${result.won ? 'You won $' + result.winnings.toFixed(2) : 'Better luck next time!'}`;
            
            modal.showModal();
            
            // Update balance
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }, 1500);
        
    } catch (error) {
        console.error('Error placing bet:', error);
    }
}

// Add event listener for bet amount changes
document.getElementById('bet-amount')?.addEventListener('input', validateBet);