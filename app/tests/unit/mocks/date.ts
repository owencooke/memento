export function mockCurrentDate(month: number, day: number, year = 2025) {
  const mockDate = new Date();
  mockDate.setFullYear(year, month, day);
  jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
  return mockDate;
}
