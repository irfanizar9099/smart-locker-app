import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders smart locker heading", () => {
  render(<App />);
  const headingElement = screen.getByRole("heading", { name: /smart locker/i });
  expect(headingElement).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /store package/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /retrieve package/i }),
  ).toBeInTheDocument();
});
