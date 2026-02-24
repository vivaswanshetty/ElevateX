const calculateXP = (coins) => {
    if (!coins || coins < 0) return 10; // Minimum 10 XP
    return 10 + Math.floor(coins / 10);
};

module.exports = { calculateXP };
