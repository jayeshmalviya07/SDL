import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Mock PrivateRoute component logic
const PrivateRoute = ({ children, role }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <div>Redirect to login</div>;
  if (role && user.role !== role) return <div>Redirect to login</div>;
  return children;
};

describe("PrivateRoute", () => {
  it("shows children when user has correct role", () => {
    const store = {
      getState: () => ({
        auth: {
          user: { role: "SUPER_ADMIN", name: "Admin" },
          token: "xxx",
        },
      }),
      subscribe: () => () => {},
      dispatch: () => {},
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrivateRoute role="SUPER_ADMIN">
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects when user is null", () => {
    const store = {
      getState: () => ({ auth: { user: null, token: null } }),
      subscribe: () => () => {},
      dispatch: () => {},
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrivateRoute role="SUPER_ADMIN">
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Redirect to login")).toBeInTheDocument();
  });

  it("redirects when user has wrong role", () => {
    const store = {
      getState: () => ({
        auth: {
          user: { role: "WISH_MASTER", name: "WM" },
          token: "xxx",
        },
      }),
      subscribe: () => () => {},
      dispatch: () => {},
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrivateRoute role="SUPER_ADMIN">
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Redirect to login")).toBeInTheDocument();
  });
});
