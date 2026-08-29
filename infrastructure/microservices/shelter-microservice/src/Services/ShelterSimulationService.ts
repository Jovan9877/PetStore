import { LogLevel } from "../Domain/enums/LogLevel";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IShelterService } from "../Domain/services/IShelterService";

export class ShelterSimulationService {
  private timer?: NodeJS.Timeout;
  constructor(private readonly service: IShelterService, private readonly logger: ILoggerService, private readonly minMs: number, private readonly maxMs: number, private readonly random: () => number = Math.random) {}
  start(): void { if (!this.timer) this.schedule(); }
  stop(): void { if (this.timer) clearTimeout(this.timer); this.timer = undefined; }
  private schedule(): void {
    const delay = this.minMs + Math.floor(this.random() * (this.maxMs - this.minMs + 1));
    this.timer = setTimeout(async () => {
      try { await this.service.simulateChange(); } catch (error) { await this.logger.log(LogLevel.ERROR, `Shelter simulation failed: ${(error as Error).message}`); }
      this.schedule();
    }, delay);
    this.timer.unref();
  }
}
