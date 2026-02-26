import { describe, it, expect, vi, beforeEach } from "vitest";
import authReducer, { login, logout } from "../store/slices/authSlice";

// Valid JWT structure: header.payload.signature (signature not verified by jwt-decode)
const mockJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4iLCJzdWIiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiJ9.abc";

describe("authSlice", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("returns initial state when no token", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it("login action stores token and decodes user", () => {
    const state = authReducer(undefined, login(mockJwt));
    expect(state.token).toBe(mockJwt);
    expect(state.user).toBeTruthy();
    expect(state.user.role).toBe("SUPER_ADMIN");
  });

  it("logout action clears state", () => {
    const withUser = authReducer(undefined, login(mockJwt));
    const afterLogout = authReducer(withUser, logout());
    expect(afterLogout.token).toBeNull();
    expect(afterLogout.user).toBeNull();
  });
});
