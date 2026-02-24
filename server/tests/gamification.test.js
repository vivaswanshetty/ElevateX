/* eslint-disable no-undef */
const { calculateXP } = require('../utils/gamification');

describe('Gamification Logic', () => {
    describe('XP Calculation', () => {
        test('should return base 10 XP for 0 coins', () => {
            expect(calculateXP(0)).toBe(10);
        });

        test('should return 10 + (coins/10) for positive coins', () => {
            expect(calculateXP(100)).toBe(20); // 10 + 10
            expect(calculateXP(50)).toBe(15);  // 10 + 5
            expect(calculateXP(28)).toBe(12);  // 10 + 2.8 (floor) -> 12
        });

        test('should handle large amounts', () => {
            expect(calculateXP(1000)).toBe(110);
        });

        test('should return minimum 10 XP for negative or invalid input', () => {
            expect(calculateXP(-50)).toBe(10);
            expect(calculateXP(null)).toBe(10);
        });
    });
});
