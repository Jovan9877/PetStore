export type CreatePlantDTO = {
  latinName: string;
  name: string;
  type: "MAMMAL" | "REPTILE" | "RODENT";
  salePrice: number;
};
