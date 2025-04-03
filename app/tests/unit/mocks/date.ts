export function mockCurrentDate(
  month: number,
  day: number,
  year = 2025,
  hours = 12,
  minutes = 30,
) {
  const mockDate = new Date();
  mockDate.setFullYear(year, month, day);
  mockDate.setHours(hours, minutes);
  jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
  return mockDate;
}
