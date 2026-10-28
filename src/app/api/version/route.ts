import { versionResponse } from "@/generated/build-version";

export const dynamic = "force-static";

export function GET(): Response { return versionResponse(); }
export function HEAD(): Response { return versionResponse("HEAD"); }
