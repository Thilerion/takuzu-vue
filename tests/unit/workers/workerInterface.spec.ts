import { WorkerInterface } from "@/workers/utils/workerInterface.js";
import type { MockedFunction } from "vitest";

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

	beforeEach(() => {
		// Create a mock worker
		mockWorker = {
			onmessage: null,
			onerror: null,
			postMessage: vi.fn((message: any) => message),
			terminate: vi.fn(),
		};

		// Create a mock createWorker function
		mockCreateWorker = vi.fn(() => mockWorker as unknown as Worker);

		// Initialize WorkerInterface with the mock createWorker function
		// workerInterfaceBase = new WorkerInterface(mockCreateWorker);
	})

	afterEach(() => {
        vi.resetAllMocks();
    });

	describe('construction', () => {
		it('should start correctly', () => {
			const workerInterface = new WorkerInterface(mockCreateWorker);
			expect(workerInterface.isReady()).toBe(true);
			expect(mockCreateWorker).toHaveBeenCalledOnce();
		});

		it('should not start if startOnInitialization is disabled', () => {
			const workerInterface = new WorkerInterface(mockCreateWorker, { startOnInitialization: false });
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
	})
})