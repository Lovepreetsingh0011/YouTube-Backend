export class ApiError extends Error {
  constructor(status, message, CustomMsg = "Something error") {
    super(message);
    (this.Msg = message), (this.Status = status);
    this.Success = false;
    this.CustomMsg = CustomMsg;
  }
}
