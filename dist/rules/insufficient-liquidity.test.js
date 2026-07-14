"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const insufficient_liquidity_1 = require("./insufficient-liquidity");
describe('checkOutboundLiquidity', () => {
    it('should return null if there is no failed payment', () => {
        const channels = [];
        const result = (0, insufficient_liquidity_1.checkOutboundLiquidity)(channels, undefined);
        expect(result).toBeNull();
    });
    it('should return null if outbound liquidity is sufficient', () => {
        const channels = [
            { state: 'Open', local_balance: '100000000' }, // 1 CKB
        ];
        const payment = { amount: '50000000' }; // 0.5 CKB
        const result = (0, insufficient_liquidity_1.checkOutboundLiquidity)(channels, payment);
        expect(result).toBeNull();
    });
    it('should return ERR_INSUFFICIENT_OUTBOUND_LIQUIDITY if payment amount exceeds max local balance', () => {
        const channels = [
            { state: 'Open', local_balance: '50000000' }, // 0.5 CKB
            { state: 'Open', local_balance: '20000000' }, // 0.2 CKB
        ];
        const payment = { amount: '100000000' }; // 1 CKB
        const result = (0, insufficient_liquidity_1.checkOutboundLiquidity)(channels, payment);
        expect(result).not.toBeNull();
        expect(result?.id).toBe('ERR_INSUFFICIENT_OUTBOUND_LIQUIDITY');
        expect(result?.reason).toContain('The payment requested 1.00 CKB, but your largest active channel only possesses 0.50 CKB');
    });
});
