import { AsyncLocalStorage } from 'node:async_hooks';

export interface StorageData {
  request: Request;
}

export const withSessionContext =
  <T extends Request>(next: (req: any, res: any) => Promise<Response | void>) =>
  async (request: T, secondParam: Response): Promise<Response | void> => {
    const asyncLocalStorage = new AsyncLocalStorage<StorageData>();

    globalThis.__unsafeRequestStorage = asyncLocalStorage;

    return asyncLocalStorage.run(
      {
        request,
      },
      () => next(request, secondParam),
    );
  };

declare global {
  // eslint-disable-next-line no-var
  var __unsafeRequestStorage: AsyncLocalStorage<StorageData> | undefined;
}
