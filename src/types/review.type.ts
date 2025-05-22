export interface Review {
  id: number;
  roomId: number;
  user: {
    id: number | null;
    username: string | null;
    email: string | null;
    phoneNumber: string | null;
    fullName: string | null;
    address: string | null;
    dob: string | null;
  };
  rating: number;
  comment: string;
  images: string[];
  createAt: string; // ISO date string, có thể parse bằng new Date()
}
