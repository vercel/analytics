import { GET } from './route';

describe('app API edge-no-context route', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => void 0);

  beforeEach(() => jest.clearAllMocks());

  it('tracks event', async () => {
    const response = await GET(new Request(new URL('/', 'http://localhost')));
    expect(response.status).toBe(200);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      '[Vercel Web Analytics] Track "Edge Event" with data {"data":"edge","router":"app","manual":true}'
    );
  });
});
