import {
  toTitleCase,
  removeUnderscores,
  fileNameSafeString,
} from "@/src/libs/string";

describe("toTitleCase", () => {
  test("converts strings to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
    expect(toTitleCase("this is a TEST")).toBe("This Is A Test");
    expect(toTitleCase("already Title Case")).toBe("Already Title Case");
  });

  test("handles special characters and mixed cases", () => {
    expect(toTitleCase("hello-world")).toBe("Hello-world");
    expect(toTitleCase("camelCase format")).toBe("Camelcase Format");
    expect(toTitleCase("snake_case_format")).toBe("Snake_case_format");
  });

  test("handles empty strings", () => {
    expect(toTitleCase("")).toBe("");
  });
});

describe("removeUnderscores", () => {
  test("replaces underscores with spaces", () => {
    expect(removeUnderscores("hello_world")).toBe("hello world");
    expect(removeUnderscores("this_is_a_test")).toBe("this is a test");
    expect(removeUnderscores("no_underscores_here")).toBe(
      "no underscores here",
    );
  });

  test("handles strings without underscores", () => {
    expect(removeUnderscores("hello world")).toBe("hello world");
    expect(removeUnderscores("nounderscores")).toBe("nounderscores");
  });

  test("handles empty strings", () => {
    expect(removeUnderscores("")).toBe("");
  });
});

describe("fileNameSafeString", () => {
  test("removes special characters from strings", () => {
    expect(fileNameSafeString("file-name.txt")).toBe("filenametxt");
    expect(fileNameSafeString("photo (2).jpg")).toBe("photo 2jpg");
    expect(fileNameSafeString("hello!@#$%^&*()_+world")).toBe("hello_world");
  });

  test("preserves alphanumeric characters and spaces", () => {
    expect(fileNameSafeString("Hello World 123")).toBe("Hello World 123");
    expect(fileNameSafeString("test file")).toBe("test file");
  });

  test("handles empty strings", () => {
    expect(fileNameSafeString("")).toBe("");
  });
});
