// src/services/job-queue.ts

type Job<T> = () => Promise<T>;

class JobQueue {
  private running = false;
  private queue: Job<any>[] = [];

  async add<T>(job: Job<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await job();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.run();
    });
  }

  private async run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        await job();
      }
    }

    this.running = false;
  }
}

export const imageJobQueue = new JobQueue();
