/**
 * Abstraction over background job processing. Current implementation is backed by
 * BullMQ + Redis, but callers depend only on this interface so it can be swapped
 * (or replaced with an in-process queue) without touching business code.
 */
export interface IJob<TPayload = unknown> {
  name: string;
  payload: TPayload;
}

export interface IJobQueue {
  enqueue<TPayload>(queue: string, job: IJob<TPayload>): Promise<void>;
}

export const JOB_QUEUE = Symbol('JOB_QUEUE');
