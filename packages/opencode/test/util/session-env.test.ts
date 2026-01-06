import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { withSessionEnv, resolveCommandToken } from "../../src/util/session-env"

const mockCtx = {
  sessionID: "ses_test123",
  messageID: "msg_test456",
  callID: "call_test789",
}

describe("util.session-env", () => {
  const originalEnv = process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN
    } else {
      process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN = originalEnv
    }
  })

  test("withSessionEnv injects raw IDs by default", () => {
    delete process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN
    const env = withSessionEnv(mockCtx, {})
    expect(env.OPENCODE_SESSION_ID).toBe("ses_test123")
    expect(env.OPENCODE_MESSAGE_ID).toBe("msg_test456")
    expect(env.OPENCODE_CALL_ID).toBe("call_test789")
    expect(env.OPENCODE_COMMAND_TOKEN).toBeUndefined()
  })

  test("withSessionEnv omits callID when not provided", () => {
    delete process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN
    const env = withSessionEnv({ sessionID: "ses_1", messageID: "msg_1" }, {})
    expect(env.OPENCODE_SESSION_ID).toBe("ses_1")
    expect(env.OPENCODE_MESSAGE_ID).toBe("msg_1")
    expect(env.OPENCODE_CALL_ID).toBeUndefined()
  })

  test("withSessionEnv preserves base environment", () => {
    delete process.env.OPENCODE_EXPERIMENTAL_COMMAND_TOKEN
    const baseEnv = { PATH: "/usr/bin", CUSTOM_VAR: "value" }
    const env = withSessionEnv(mockCtx, baseEnv)
    expect(env.PATH).toBe("/usr/bin")
    expect(env.CUSTOM_VAR).toBe("value")
    expect(env.OPENCODE_SESSION_ID).toBe("ses_test123")
  })
})
