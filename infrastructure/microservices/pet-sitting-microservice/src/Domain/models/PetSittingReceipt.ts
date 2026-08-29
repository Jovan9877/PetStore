export type PetSittingReceipt = {
  id: number;
  stayId: number;
  sellerName: string;
  issuedAt: string;
  billableHours: number;
  hourlyRate: number;
  totalAmount: number;
};
