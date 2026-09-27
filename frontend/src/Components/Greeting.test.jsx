import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Greeting from "./greeting";

describe("Greeting", () => {
  it("renders the greeting message", () => {
    render(<Greeting />);

    expect(
      screen.getByRole("heading", {
        name: /hello punit/i,
      })
    ).toBeInTheDocument();
  });
});