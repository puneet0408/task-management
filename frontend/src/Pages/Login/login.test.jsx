import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";

describe("Login", () => {
  it("allows login when email and password are valid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText("Email");

    await user.type(emailInput, "user@example.com");

    const passwordInput = screen.getByLabelText("Password");

    await user.type(passwordInput, "1234");

    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });

  it("shows required message when submitted with an empty email", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const loginButton = screen.getByRole("button", {
      name: /sign In/i,
    });

    await user.click(loginButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows required message when password is empty", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText("Email");

    await user.type(emailInput, "user@example.com");

    const loginButton = screen.getByRole("button", {
      name: /sign In/i,
    });

    await user.click(loginButton);

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
it("shows validation error for invalid email", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = screen.getByLabelText("Email");
  const passwordInput = screen.getByLabelText("Password");

  await user.type(emailInput, "hello");
  await user.type(passwordInput, "1234");

  expect(emailInput).toHaveValue("hello");
  expect(passwordInput).toHaveValue("1234");

  await user.click(
    screen.getByRole("button", {
      name: /sign in/i,
    })
  );

  screen.debug();


  expect(
    await screen.findByText(/enter a valid email/i)
  ).toBeInTheDocument();
});
});
