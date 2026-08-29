export interface CreatePetDTO {
  latinName: string;
  name: string;
  type: "MAMMAL" | "REPTILE" | "RODENT";
  salePrice: number;
}
