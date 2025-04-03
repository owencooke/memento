# Collage Generation

The Jest tests for frontend white-box testing were written with the help of Generative AI and iterated upon to improve the quality of the result (code and testing coverage). The prompts and output are cited below.

LLM Model used: Claude 3.7 Sonnet

## Prompt

### User Input

write a jest unit test for all possibilities of these date utilities

### LLM Output

Plan for Testing Date Utilities
Create a test file for the date utilities
Test toISODateString function with:
Date object input
EXIF format string (YYYY:MM:DD HH:MM:SS)
ISO format string (YYYY-MM-DDTHH:MM:SS)
Edge cases
Test getDateFromISO function with:
Valid ISO date string
Edge cases like month boundaries
Include tests for different date formats and potential errors

```typescript
import { toISODateString, getDateFromISO } from "@/src/libs/date";

describe("toISODateString", () => {
  test("converts Date object to ISO string format YYYY-MM-DD", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    expect(toISODateString(date)).toBe("2023-01-15");

    const date2 = new Date(2023, 11, 31); // December 31, 2023
    expect(toISODateString(date2)).toBe("2023-12-31");

    const date3 = new Date(2023, 9, 5); // October 5, 2023
    expect(toISODateString(date3)).toBe("2023-10-05");
  });

  test("converts EXIF format string (YYYY:MM:DD HH:MM:SS) to ISO date string", () => {
    const exifDate = "2023:02:15 14:30:25";
    expect(toISODateString(exifDate)).toBe("2023-02-15");

    const exifDate2 = "2022:12:01 09:45:00";
    expect(toISODateString(exifDate2)).toBe("2022-12-01");
  });

  test("converts ISO format string (YYYY-MM-DDTHH:MM:SS) to ISO date string", () => {
    const isoDate = "2023-03-20T10:15:30";
    expect(toISODateString(isoDate)).toBe("2023-03-20");

    const isoDate2 = "2023-11-05T22:45:10.123Z";
    expect(toISODateString(isoDate2)).toBe("2023-11-05");
  });

  test("handles single-digit months and days properly", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(toISODateString(date)).toBe("2023-01-01");

    const date2 = new Date(2023, 8, 9); // September 9, 2023
    expect(toISODateString(date2)).toBe("2023-09-09");
  });
});

describe("getDateFromISO", () => {
  test("converts ISO date string to Date object", () => {
    const dateStr = "2023-04-15";
    const date = getDateFromISO(dateStr);

    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(3); // April is 3 (zero-based index)
    expect(date.getDate()).toBe(15);
  });

  test("handles month boundaries correctly", () => {
    const dateStr1 = "2023-01-01";
    const date1 = getDateFromISO(dateStr1);
    expect(date1.getFullYear()).toBe(2023);
    expect(date1.getMonth()).toBe(0); // January is 0
    expect(date1.getDate()).toBe(1);

    const dateStr2 = "2023-12-31";
    const date2 = getDateFromISO(dateStr2);
    expect(date2.getFullYear()).toBe(2023);
    expect(date2.getMonth()).toBe(11); // December is 11
    expect(date2.getDate()).toBe(31);
  });

  test("preserved local time", () => {
    const dateStr = "2023-06-15";
    const date = getDateFromISO(dateStr);

    // Check if it's initialized to midnight in local time
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);

    // Converting back should give the same date string
    expect(toISODateString(date)).toBe(dateStr);
  });
});
```

## Prompt

### User Input

ok great. let's do the same thing for string utilities

### LLM Output

I'll create tests for the string utilities following the same pattern as the date utilities test file.

```typescript
import {
  toTitleCase,
  removeUnderscores,
  mimeTypeToExtension,
  fileNameSafeString,
} from "@/src/libs/string";

describe("toTitleCase", () => {
  test("converts strings to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
    expect(toTitleCase("this is a TEST")).toBe("This Is A Test");
    expect(toTitleCase("already Title Case")).toBe("Already Title Case");
  });

  test("handles special characters and mixed cases", () => {
    expect(toTitleCase("hello-world")).toBe("Hello-World");
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

describe("mimeTypeToExtension", () => {
  test("extracts extension from common MIME types", () => {
    expect(mimeTypeToExtension("image/jpeg")).toBe("jpeg");
    expect(mimeTypeToExtension("image/png")).toBe("png");
    expect(mimeTypeToExtension("application/pdf")).toBe("pdf");
    expect(mimeTypeToExtension("text/html")).toBe("html");
  });

  test("handles MIME types with parameters", () => {
    expect(mimeTypeToExtension("image/jpeg; charset=utf-8")).toBe("jpeg");
  });

  test("defaults to png for invalid MIME types", () => {
    expect(mimeTypeToExtension("invalid")).toBe("png");
    expect(mimeTypeToExtension("")).toBe("png");
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
```

## Prompt

### User Input

### LLM Output
