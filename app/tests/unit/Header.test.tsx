import { render, userEvent } from "@testing-library/react-native";
import Header from "@/src/components/navigation/Header";
import { MockAuthProvider } from "./mocks/AuthProvider";
import { ThemeProvider } from "@/src/context/ThemeContext";

const renderHeader = (signOutMock = jest.fn()) =>
  render(
    <MockAuthProvider signOut={signOutMock}>
      <ThemeProvider>
        <Header title="Test" />
      </ThemeProvider>
    </MockAuthProvider>
  );

describe("Header", () => {
  test("renders title correctly", () => {
    const { getByText } = renderHeader();
    expect(getByText("Test")).toBeTruthy();
  });

  test("opens menu when avatar clicked", async () => {
    const { getByTestId } = renderHeader();
    const menuTrigger = getByTestId("user-menu-trigger");
    expect(menuTrigger.props.accessibilityState.expanded).toBe(false);

    await userEvent.press(getByTestId("user-menu-trigger"));

    expect(menuTrigger.props.accessibilityState.expanded).toBe(true);
  });
});
