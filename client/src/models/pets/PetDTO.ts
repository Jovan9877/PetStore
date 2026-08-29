export interface PetDTO {
  id: number;
  latinName: string;
  name: string;
  type: "MAMMAL" | "REPTILE" | "RODENT";
  salePrice: number;
  sold: boolean;
}
