import {
  render,
  screen,
  waitFor,
  userEvent,
} from "@testing-library/react-native";
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
  test("renders correctly with the given title", () => {
    const { getByText } = renderHeader();
    expect(getByText("Test")).toBeTruthy();
  });

  test("avatar opens menu and sign out is clickable", async () => {
    const signOutMock = jest.fn();
    const { getByTestId } = renderHeader(signOutMock);

    // Open the menu
    await userEvent.press(getByTestId("avatar-menu-trigger"));
    await waitFor(() => screen.debug());

    // Wait for the "Sign out" button to appear
    const signOutButton = await screen.findByText("Sign out");

    // Click the sign-out button
    await userEvent.press(signOutButton);

    // Check if the signOut method is called
    expect(signOutMock).toHaveBeenCalled();
  });
});
