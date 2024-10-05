export class ApiError {
    message: string;
    email?: string;
  
    constructor(data: string, email: string) {
      this.message = data;
      this.email = email;
    }
  }
  