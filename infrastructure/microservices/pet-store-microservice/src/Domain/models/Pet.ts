import { PetType } from "../enums/PetType";

export type Pet = {
  id: number;
  latinName: string;
  name: string;
  type: PetType;
  salePrice: number;
  sold: boolean;
};
