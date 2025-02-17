import React from "react";
import { render } from "@testing-library/react-native";
import Header from "@/src/components/navigation/Header";

describe("Header", () => {
  test("renders correctly with the given title", () => {
    const { getByText } = render(<Header title="Test" />);
    expect(getByText("Test")).toBeTruthy();
  });
});
