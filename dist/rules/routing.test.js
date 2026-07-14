"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routing_1 = require("./routing");
describe('checkRoutingTopology', () => {
    it('should return null if there is no failed payment object', () => {
        const result = (0, routing_1.checkRoutingTopology)([], undefined);
        expect(result).toBeNull();
    });
    it('should return null if the payment did not fail with a routing error', () => {
        const channels = [];
        const payment = { status: 'Success', error_code: null };
        const result = (0, routing_1.checkRoutingTopology)(channels, payment);
        expect(result).toBeNull();
    });
    it('should return ERR_NO_ACTIVE_CHANNELS if payment failed and there are no open channels', () => {
        const channels = [{ state: 'Pending' }]; // No 'Open' channels
        const payment = { error_code: 'ROUTE_NOT_FOUND' };
        const result = (0, routing_1.checkRoutingTopology)(channels, payment);
        expect(result).not.toBeNull();
        expect(result?.id).toBe('ERR_NO_ACTIVE_CHANNELS');
        expect(result?.problem).toContain('cannot identify an available execution path');
    });
    it('should return null if payment failed but there is at least one open channel', () => {
        const channels = [{ state: 'Open' }];
        const payment = { error_code: 'ROUTE_NOT_FOUND' };
        const result = (0, routing_1.checkRoutingTopology)(channels, payment);
        expect(result).toBeNull();
    });
});
