export interface Parser<T> {
  parse(input: string): T;
  render(input: T): string;
}
