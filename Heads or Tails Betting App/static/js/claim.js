async function claimTimeReward() {
    try {
        const response = await fetch('/claim_time_reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const modal = document.getElementById('result-modal');
            const titleEl = document.getElementById('result-title');
            const messageEl = document.getElementById('result-message');
            
            titleEl.textContent = 'Success!';
            messageEl.textContent = `You claimed €0.05! Next claim available in 10 minutes.`;
            
            modal.showModal();
            
            // Disable button and start countdown
            document.getElementById('claimBtn').disabled = true;
            startCountdown(600); // 10 minutes in seconds
            
            // Update balance
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    } catch (error) {
        console.error('Error claiming reward:', error);
    }
}

async function claimCase() {
    try {
        const response = await fetch('/claim_case', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        const modal = document.getElementById('result-modal');
        const titleEl = document.getElementById('result-title');
        const messageEl = document.getElementById('result-message');
        
        titleEl.textContent = 'Case Opened!';
        messageEl.textContent = `You won €${result.amount.toFixed(2)}!`;
        
        modal.showModal();
        
        // Update balance
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Error opening case:', error);
    }
}

function startCountdown(seconds) {
    const countdownEl = document.getElementById('countdown');
    const timeLeftEl = document.getElementById('timeLeft');
    
    timeLeftEl.style.display = 'block';
    
    function updateCountdown() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        countdownEl.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            clearInterval(interval);
            document.getElementById('claimBtn').disabled = false;
            timeLeftEl.style.display = 'none';
        } else {
            seconds--;
        }
    }
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
}