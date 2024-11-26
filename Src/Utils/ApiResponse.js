export class ApiResponse {
  constructor(status, data, message) {
    (this.Status = status), (this.Data = data), (this.Msg = message);
    this.Success = true;
  }
}
