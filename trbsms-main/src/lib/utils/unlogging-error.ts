export default class UnloggingError<Field> extends Error {
  constructor(
    message: string,
    public field?: Field,
  ) {
    super(message);
  }
}
