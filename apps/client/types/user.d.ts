type UserRole = "CLIENT" | "CREATOR";
type UserStatus = "ACTIVE" | "SUSPENDED";

interface User {
  id: string;
  role: Nullable<UserRole>;
  status: UserStatus;
  name: string;
  email: Nullable<string>;
  emailVerifiedAt: Nullable<Date>;
  phoneNumber: Nullable<string>;
  phoneNumberVerifiedAt: Nullable<Date>;
  photo: Nullable<string>;
  creator: Nullable<Creator>;
  wallet: number;
  bookWallet: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BasicUser {
  id: string;
  name: string;
  role: Nullable<UserRole>;
  photo: Nullable<string>;
}
