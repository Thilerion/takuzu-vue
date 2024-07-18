import type { WorkerError, WorkerSuccess } from "@/workers/utils/types.js";
import { WorkerInterface, type WorkerRequestId } from "@/workers/utils/workerInterface.js";

// Mock worker type
type MockWorker = {
	onmessage: ((event: MessageEvent) => void) | null;
	onerror: ((event: ErrorEvent) => void) | null;
	postMessage: (message: any) => void;
	terminate: () => void;
};

describe('WorkerInterface', () => {
	// let workerInterfaceBase: WorkerInterface<any>;
	let mockCreateWorker = vi.fn(() => mockWorker as unknown as Worker);
	let mockWorker: MockWorker;
	let workerInterface: WorkerInterface<any>;
	let lastRequestId: string | null = null;

	beforeEach(() => {
		// Create a mock worker
		mockWorker = {
			onmessage: null,
			onerror: null,
			postMessage: vi.fn((message: any) => {
				lastRequestId = message.id;
				return message;
			}),
			terminate: vi.fn(),
		};

		// Create a mock createWorker function
		mockCreateWorker = vi.fn(() => mockWorker as unknown as Worker);

		// Initialize WorkerInterface with the mock createWorker function
		// workerInterfaceBase = new WorkerInterface(mockCreateWorker);
		workerInterface = new WorkerInterface(mockCreateWorker);
	})
	afterEach(() => {
        vi.resetAllMocks();
		lastRequestId = null;
    });


	const simulateWorkerMessage = (data: (Omit<WorkerError, 'id'> | Omit<WorkerSuccess<any>, 'id'>) & { id?: string | null }) => {
		const msg = {
			...data,
			id: data.id ?? lastRequestId,
		}
        if (mockWorker.onmessage && msg.id) {
            mockWorker.onmessage({ data: msg } as MessageEvent);
        } else {
            throw new Error('No request ID available or onmessage not set');
        }
    };

	describe('initialization and lifecycle', () => {
		it('should start correctly', () => {
			expect(workerInterface.isReady()).toBe(true);
			expect(mockCreateWorker).toHaveBeenCalledOnce();
		});

		it('should not start if startOnInitialization is disabled', () => {
			const mockCreateWorker2 = vi.fn(() => mockWorker as unknown as Worker);
			const workerInterface2 = new WorkerInterface(mockCreateWorker2, { startOnInitialization: false });
			expect(workerInterface2.isReady()).toBe(false);
			expect(mockCreateWorker2).not.toHaveBeenCalled();
		})

		it('should restart the worker', () => {
            workerInterface.restart();
            expect(mockWorker.terminate).toHaveBeenCalled();
            expect(mockCreateWorker).toHaveBeenCalledTimes(2);
        });

        it('should force terminate the worker', () => {
            const workerInterface = new WorkerInterface(mockCreateWorker);
            workerInterface.forceTerminate('Custom message');
            expect(mockWorker.terminate).toHaveBeenCalled();
            expect(workerInterface.isReady()).toBe(false);
        });
	})

	describe('restart', () => {
		it('should clear all internal state on restart', async () => {
			const startMock = vi.spyOn(workerInterface, 'start');
			expect(startMock).not.toHaveBeenCalled();

			// Create ongoing requests and statuses
			const { id: id1 } = workerInterface.requestWithId('testFunc', 'arg1');
			const { id: id2 } = workerInterface.requestWithId('testFunc', 'arg2');

			// The ids are set in ongoing requests and statuses
			expect(workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] })).not.toBeNull();
			expect(workerInterface.findOngoingRequest('testFunc', { args: ['arg2'] })).not.toBeNull();

			expect(workerInterface.checkRequestStatus(id1)).toBe('pending');
			expect(workerInterface.checkRequestStatus(id2)).toBe('pending');

			// Create a request that will be resolved before the restart
			const abrakadabraRequest = workerInterface.requestWithId('abrakadabra');
			simulateWorkerMessage({ id: abrakadabraRequest.id, success: true, result: 'abrakadabra' });
			await abrakadabraRequest.promise;
			expect(workerInterface.checkRequestStatus(abrakadabraRequest.id)).toBe('success');
			expect(workerInterface.findOngoingRequest('abrakadabra', { args: [] })).toBeNull();

			// Restart the worker interface
			workerInterface.restart();

			// The ids should be cleared
			expect(workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] })).toBeNull();
			expect(workerInterface.findOngoingRequest('testFunc', { args: ['arg2'] })).toBeNull();

			// Request statuses should not be cleared, and set to "aborted" if they were pending
			expect(workerInterface.checkRequestStatus(id1)).toBe('aborted');
			expect(workerInterface.checkRequestStatus(id2)).toBe('aborted');
			// But the status of the abrakadabra request should be "success" because it was resolved before the restart
			expect(workerInterface.checkRequestStatus(abrakadabraRequest.id)).toBe('success');

			// Start has been called
			expect(startMock).toHaveBeenCalledOnce();
		})

		it('should not restart if worker has not started yet/is not ready', () => {
			const workerInterface = new WorkerInterface(mockCreateWorker, { startOnInitialization: false });
			expect(workerInterface.isReady()).toBe(false);
			const startMock = vi.spyOn(workerInterface, 'start');
			workerInterface.restart();
			expect(startMock).not.toHaveBeenCalled();
		})

		it('should reject and abort pending requests if worker restarts', async () => {
			const promise1 = workerInterface.request('testFunc1', 'arg1');
            const promise2 = workerInterface.request('testFunc2', 'arg2');
            
            workerInterface.restart();

            await expect(promise1).rejects.toThrow('Worker terminated');
            await expect(promise2).rejects.toThrow('Worker terminated');
		})
	})

	describe('autoStart behavior', () => {
		it('should automatically start worker on first request if autoStart is true', () => {
            const mockCreateWorker = vi.fn(() => mockWorker as unknown as Worker);
			const workerInterface = new WorkerInterface(mockCreateWorker, { startOnInitialization: false, autoStart: true });
            
            expect(workerInterface.isReady()).toBe(false);
            
            workerInterface.request('testFunc', 'arg1');

            expect(workerInterface.isReady()).toBe(true);
            expect(mockCreateWorker).toHaveBeenCalledTimes(1);
        });

		it('should throw an error on first request if autoStart is false', () => {
			const mockCreateWorker = vi.fn(() => mockWorker as unknown as Worker);
			const workerInterface = new WorkerInterface(mockCreateWorker, { startOnInitialization: false, autoStart: false });
			expect(workerInterface.isReady()).toBe(false);

			expect(() => workerInterface.request('testFunc', 'arg1'))
				.toThrowErrorMatchingInlineSnapshot(`[Error: Worker is not running, cannot make request because autoStart is disabled. Call .start() first to manually start the worker instance.]`);

			expect(workerInterface.isReady()).toBe(false);
			expect(mockCreateWorker).not.toHaveBeenCalled();
		})
	})

	describe('request()', () => {
		it('should correctly make a request', async () => {
			const workerInterface = new WorkerInterface(mockCreateWorker);
			const requestPromise = workerInterface.request('testFunction', 'arg1', 'arg2');

			// Simulate worker response
			mockWorker.onmessage!({
				data: {
					id: requestPromise.id,
					success: true,
					result: 'testResult'
				}
			} as MessageEvent);

			const result = await requestPromise;
			expect(result).toBe('testResult');

			expect(mockWorker.postMessage).toHaveBeenCalledWith({
				id: requestPromise.id,
				fn: 'testFunction',
				args: ['arg1', 'arg2']
			});
		})

		it('should correctly handle error responses', async () => {
			const onResolve = vi.fn();
			const onReject = vi.fn();

			const workerInterface = new WorkerInterface(mockCreateWorker);
			const requestPromiseWithId = workerInterface
				.request('testFunction', 'arg1', 'arg2');
			const requestPromise = requestPromiseWithId
				.then(onResolve)
				.catch(onReject);

			// Simulate worker response
			mockWorker.onmessage!({
				data: {
					id: requestPromiseWithId.id,
					success: false,
					error: 'testError'
				}
			} as MessageEvent);

			await requestPromise;
			expect(onReject).toHaveBeenCalledWith('testError');
			expect(onResolve).not.toHaveBeenCalled();
		});

		it('should deduplicate requests', async () => {
            const promise1 = workerInterface.requestDeduplicated('testFunc', 'arg1');
            const promise2 = workerInterface.requestDeduplicated('testFunc', 'arg1');
            expect(promise1).toBe(promise2);
			expect(promise1.id).toBe(promise2.id);

            simulateWorkerMessage({ success: true, result: 'testResult' });
            const [result1, result2] = await Promise.all([promise1, promise2]);
            expect(result1).toBe('testResult');
            expect(result2).toBe('testResult');
        });

		it('should not deduplicate requests with different arguments', async () => {
            const promise1 = workerInterface.requestDeduplicated('testFunc', 'arg1');
            const promise2 = workerInterface.requestDeduplicated('testFunc');
            const promise3 = workerInterface.requestDeduplicated('testFunc', 'arg2');
            expect(promise1).not.toBe(promise2);
			expect(promise1).not.toBe(promise3);
			expect(promise2).not.toBe(promise3);
			const ids = new Set([promise1.id, promise2.id, promise3.id]);
			expect(ids.size).toBe(3);

			for (const id of ids) {
				simulateWorkerMessage({ success: true, result: 'testResult', id });
			}

            const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);
            expect(result1).toBe('testResult');
            expect(result2).toBe('testResult');
			expect(result3).toBe('testResult');
        });

	})

	describe('Ongoing Request Management', () => {
        it('should find ongoing requests', async () => {
            workerInterface.request('testFunc', 'arg1');
            const foundRequest = workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] });
            expect(foundRequest).not.toBeNull();
            expect(foundRequest?.funcName).toBe('testFunc');
        });

		it('should remove ongoing requests after resolve', async () => {
			const promise = workerInterface.request('testFunc', 'arg1');
            const foundRequest = workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] });
            expect(foundRequest).not.toBeNull();

            simulateWorkerMessage({ success: true, result: 'testResult' });
            await promise;

            const notFoundRequest = workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] });
            expect(notFoundRequest).toBeNull();
		})

		it('should remove ongoing requests after reject', async () => {
			const promise = workerInterface.request('testFunc', 'arg1');
            const foundRequest = workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] });
            expect(foundRequest).not.toBeNull();

            simulateWorkerMessage({ success: false, error: 'testError' });
            await promise.catch(() => {});

			const notFoundRequest = workerInterface.findOngoingRequest('testFunc', { args: ['arg1'] });
			expect(notFoundRequest).toBeNull();
		})
    });

	describe('Status Management', () => {
        it('should track request status (from pending to success)', async () => {
            const { promise, id } = workerInterface.requestWithId('testFunc', 'arg1');
            expect(workerInterface.checkRequestStatus(id)).toBe('pending');

            simulateWorkerMessage({ success: true, result: 'testResult' });
            await promise;

            expect(workerInterface.checkRequestStatus(id)).toBe('success');
        });

		it('should track request status (from pending to error)', async () => {
            const { promise, id } = workerInterface.requestWithId('testFunc', 'arg1');
            expect(workerInterface.checkRequestStatus(id)).toBe('pending');

            simulateWorkerMessage({ success: false, error: 'testError' });
            await promise.catch(() => {});

            expect(workerInterface.checkRequestStatus(id)).toBe('error');
		})

        it('should clean up old request statuses', async () => {
			const requestIds = new Set<string>();
            for (let i = 1; i <= 950; i++) {
                const { promise, id } = workerInterface.requestWithId(`testFunc${i}`, 'arg1');
				requestIds.add(id);
				expect(requestIds.size).toBe(i);
                simulateWorkerMessage({ id, success: true, result: 'testResult' });
                await promise;
            }
			
			// Get request status for all ids, should all be found
			expect([...requestIds].every(id => workerInterface.checkRequestStatus(id) === 'success')).toBe(true);

			for (let i = 1; i < 100; i++) {
				const { promise, id } = workerInterface.requestWithId(`testFunc${i}`, 'arg1');
				requestIds.add(id);
                simulateWorkerMessage({ id, success: true, result: 'testResult' });
                await promise;
			}

			expect(requestIds.size).toBeGreaterThan(1000);

			// Get request status for all ids, not more than 1000 should be found
			let foundCount = 0;
			for (const id of requestIds) {
				if (workerInterface.checkRequestStatus(id) === 'success') {
					foundCount += 1;
				}
			}
			expect(foundCount).toBeLessThanOrEqual(1000);
        });

		it('does not clean up pending requests', async () => {
			const requests: { promise: Promise<any>, id: WorkerRequestId }[] = [];
            for (let i = 1; i <= 1000; i++) {
                const { promise, id } = workerInterface.requestWithId(`testFunc${i}`, 'arg1');
				requests.push({ promise, id });
            }

			// All requests should be pending
			expect(requests.every(req => workerInterface.checkRequestStatus(req.id) === 'pending')).toBe(true);

			for (let i = 1; i <= 500; i++) {
				const { promise, id } = workerInterface.requestWithId(`testFunc${i}`, 'arg1');
				requests.push({ promise, id });
			}

			// All requests should still be found and pending
			expect(requests.every(req => workerInterface.checkRequestStatus(req.id) === 'pending')).toBe(true);
			const requestIds = new Set(requests.map(req => req.id));

			// Resolve all requests
			for (const req of requests) {
				simulateWorkerMessage({ id: req.id, success: true, result: 'testResult' });
				await req.promise;
			}

			// Only now should request statuses be cleaned up
			expect([...requestIds].some(id => workerInterface.checkRequestStatus(id) === null)).toBe(true);
		})
    });

	describe('Utility Methods', () => {
        it('should create a request function', async () => {
            const requestFn = workerInterface.getRequestFn('testFunc');
            const promise = requestFn('arg1', 'arg2');
            expect(mockWorker.postMessage).toHaveBeenCalledWith(expect.objectContaining({
                fn: 'testFunc',
                args: ['arg1', 'arg2']
            }));

            simulateWorkerMessage({ success: true, result: 'testResult' });
            const result = await promise;
            expect(result).toBe('testResult');
        });

        it('should return a promise and id with requestWithId', () => {
            const { promise, id } = workerInterface.requestWithId('testFunc', 'arg1');
            expect(promise).toBeInstanceOf(Promise);
            expect(typeof id).toBe('string');
        });
    });
})