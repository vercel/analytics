import { NextRequest } from 'next/server';
import GET from './test';

describe('pages API edge route', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => void 0);

  beforeEach(() => jest.clearAllMocks());

  it('tracks event', async () => {
    const request = new NextRequest(new URL('/', 'http://localhost'));
    // @ts-expect-error -- we should pass a NextFetchEvent instead an empty object, but it's not used.
    const response = await GET(request, {});
    expect(response.status).toBe(200);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      '[Vercel Web Analytics] Track "Pages Api Route" with data {"runtime":"edge","router":"pages"}'
    );
  });
});
