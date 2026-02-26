import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import App from "../App";

const mockStore = configureStore([]);

describe("App routing", () => {
  it("shows login page at /login", () => {
    const store = mockStore({ auth: { user: null, token: null } });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByPlaceholderText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /LOG IN/i })).toBeInTheDocument();
  });
});
