import { versionResponse } from "./build-version";
import { secureApiResponse } from "./security";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/api/version" || path === "/api/version/")
      return secureApiResponse(versionResponse(request.method));
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
