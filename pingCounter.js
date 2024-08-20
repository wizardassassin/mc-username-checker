export class PingCounter {
    successCount;
    count;
    startTime;
    constructor() {
        this.successCount = 0;
        this.count = 0;
        this.startTime = Date.now();
    }
    ping() {
        if (this.count === 0) this.startTime = Date.now();
        this.count++;
    }
    pingSuccess() {
        this.successCount++;
    }
    getStats() {
        return {
            successCount: this.successCount,
            pingCount: this.count,
            pingsPerMin:
                this.count / ((Date.now() - this.startTime) / 1000 / 60),
            successPerMin:
                this.successCount / ((Date.now() - this.startTime) / 1000 / 60),
        };
    }
}
