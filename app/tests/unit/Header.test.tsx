import React from "react";
import { render } from "@testing-library/react-native";
import Header from "@/src/components/navigation/Header";
import { MockAuthProvider } from "./mocks/AuthProvider";
import { ThemeProvider } from "@/src/context/ThemeContext";

describe("Header", () => {
  test("renders correctly with the given title", () => {
    const { getByText } = render(
      <MockAuthProvider>
        <ThemeProvider>
          <Header title="Test" />
        </ThemeProvider>
      </MockAuthProvider>
    );
    expect(getByText("Test")).toBeTruthy();
  });
});
