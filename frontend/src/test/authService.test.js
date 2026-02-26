import { describe, it, expect, vi, beforeEach } from "vitest";
import { login } from "../services/authService";
import axios from "axios";

vi.mock("axios");

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login calls POST /auth/login with emailOrEmpId and password", async () => {
    axios.post.mockResolvedValue({ data: { token: "jwt-token-123" } });
    const result = await login("admin@test.com", "password123");
    expect(axios.post).toHaveBeenCalledWith(
      "/api/auth/login",
      { emailOrEmpId: "admin@test.com", password: "password123" }
    );
    expect(result).toEqual({ token: "jwt-token-123" });
  });
});
