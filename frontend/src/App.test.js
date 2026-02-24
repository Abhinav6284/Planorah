import {
  MAX_SESSION_DAYS,
  clearTokens,
  getAccessToken,
  getLoginTimestamp,
  isSessionExpired,
  setTokens,
} from "./utils/auth";

jest.mock("axios", () => ({ post: jest.fn() }), { virtual: true });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.restoreAllMocks();
});

test("stores remembered session in localStorage with timestamp", () => {
  setTokens("access-1", "refresh-1", true);

  expect(localStorage.getItem("access_token")).toBe("access-1");
  expect(localStorage.getItem("refresh_token")).toBe("refresh-1");
  expect(getLoginTimestamp()).not.toBeNull();
  expect(sessionStorage.getItem("access_token")).toBeNull();
});

test("stores non-remembered session in sessionStorage", () => {
  setTokens("access-2", "refresh-2", false);

  expect(sessionStorage.getItem("access_token")).toBe("access-2");
  expect(sessionStorage.getItem("refresh_token")).toBe("refresh-2");
  expect(localStorage.getItem("access_token")).toBeNull();
  expect(getAccessToken()).toBe("access-2");
});

test("marks remembered session as expired after max duration", () => {
  const now = Date.now();
  jest.spyOn(Date, "now").mockReturnValue(now);
  setTokens("access-3", "refresh-3", true);

  const expiredNow =
    now + (MAX_SESSION_DAYS * 24 * 60 * 60 * 1000 + 1);
  Date.now.mockReturnValue(expiredNow);

  expect(isSessionExpired()).toBe(true);

  clearTokens();
  expect(getAccessToken()).toBeNull();
});
