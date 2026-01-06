import { Flag } from "../flag/flag"
import { randomBytes } from "crypto"

export interface SessionContext {
  sessionID: string
  messageID: string
  callID?: string
}

const TOKEN_TTL_MS = 5 * 60 * 1000
const tokenStore = new Map<string, { ctx: SessionContext; expires: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [token, entry] of tokenStore) {
    if (entry.expires < now) {
      tokenStore.delete(token)
    }
  }
}, 60_000)

function generateCommandToken(ctx: SessionContext): string {
  const token = `tok_${randomBytes(16).toString("hex")}`
  tokenStore.set(token, { ctx, expires: Date.now() + TOKEN_TTL_MS })
  return token
}

export function resolveCommandToken(token: string): SessionContext | undefined {
  const entry = tokenStore.get(token)
  if (!entry) return undefined
  if (entry.expires < Date.now()) {
    tokenStore.delete(token)
    return undefined
  }
  return entry.ctx
}

export function withSessionEnv(
  ctx: SessionContext,
  baseEnv: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  if (Flag.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN) {
    return {
      ...baseEnv,
      OPENCODE_COMMAND_TOKEN: generateCommandToken(ctx),
    }
  }

  return {
    ...baseEnv,
    OPENCODE_SESSION_ID: ctx.sessionID,
    OPENCODE_MESSAGE_ID: ctx.messageID,
    ...(ctx.callID && { OPENCODE_CALL_ID: ctx.callID }),
  }
}
