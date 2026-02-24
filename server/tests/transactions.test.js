/* eslint-disable no-undef */
const { deposit, withdraw } = require('../controllers/transactionController');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Mock Mongoose models
jest.mock('../models/User');
jest.mock('../models/Transaction');

describe('Transaction Controller Logic', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { _id: 'user123' },
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('deposit', () => {
        test('should increase user coins and create transaction', async () => {
            const mockUser = {
                _id: 'user123',
                coins: 100,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findById.mockResolvedValue(mockUser);
            req.body.amount = 50;

            await deposit(req, res);

            expect(mockUser.coins).toBe(150);
            expect(mockUser.save).toHaveBeenCalled();
            expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                user: 'user123',
                type: 'deposit',
                amount: 50
            }));
            expect(res.json).toHaveBeenCalledWith({ coins: 150 });
        });
    });

    describe('withdraw', () => {
        test('should decrease user coins if sufficient funds', async () => {
            const mockUser = {
                _id: 'user123',
                coins: 100,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findById.mockResolvedValue(mockUser);
            req.body.amount = 50;

            await withdraw(req, res);

            expect(mockUser.coins).toBe(50);
            expect(mockUser.save).toHaveBeenCalled();
            expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                user: 'user123',
                type: 'withdraw',
                amount: 50
            }));
            expect(res.json).toHaveBeenCalledWith({ coins: 50 });
        });

        test('should return 400 if insufficient funds', async () => {
            const mockUser = {
                _id: 'user123',
                coins: 10,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findById.mockResolvedValue(mockUser);
            req.body.amount = 50;

            await withdraw(req, res);

            // Expect status 400
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Insufficient funds'
            }));
            expect(mockUser.save).not.toHaveBeenCalled();
            expect(Transaction.create).not.toHaveBeenCalled();
        });
    });
});
