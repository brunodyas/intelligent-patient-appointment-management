export type ResetPassword = {
  uid?: string;
  token?: string;
  new_password?: string;
  email?: string;
  confirm_password?: string;
};

export type ConfirmResetPassword = {
  uid?: string;
  token?: string;
};