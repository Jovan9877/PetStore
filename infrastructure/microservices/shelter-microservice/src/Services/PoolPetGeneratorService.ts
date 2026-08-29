import { ShelterPetStatus } from "../Domain/enums/ShelterPetStatus";
import { ShelterPetType } from "../Domain/enums/ShelterPetType";
import { ShelterPet } from "../Domain/models/ShelterPet";
import { IPetGeneratorService } from "../Domain/services/IPetGeneratorService";

const pool = [
  { name: "Aki", breed: "Labrador Retriever", type: ShelterPetType.DOG },
  { name: "Bella", breed: "Mixed Breed", type: ShelterPetType.DOG },
  { name: "Leo", breed: "German Shepherd", type: ShelterPetType.DOG },
  { name: "Max", breed: "Beagle", type: ShelterPetType.DOG },
  { name: "Daisy", breed: "Golden Retriever", type: ShelterPetType.DOG },
  { name: "Rocky", breed: "Terrier Mix", type: ShelterPetType.DOG },
  { name: "Nala", breed: "Border Collie", type: ShelterPetType.DOG },
  { name: "Toby", breed: "Cocker Spaniel", type: ShelterPetType.DOG },
  { name: "Lola", breed: "European Shorthair", type: ShelterPetType.CAT },
  { name: "Mia", breed: "Siamese", type: ShelterPetType.CAT },
  { name: "Zoe", breed: "Domestic Shorthair", type: ShelterPetType.CAT },
  { name: "Luna", breed: "Maine Coon Mix", type: ShelterPetType.CAT },
  { name: "Oliver", breed: "British Shorthair", type: ShelterPetType.CAT },
  { name: "Cleo", breed: "Calico", type: ShelterPetType.CAT },
  { name: "Milo", breed: "Tabby", type: ShelterPetType.CAT },
  { name: "Ivy", breed: "Russian Blue Mix", type: ShelterPetType.CAT },
  { name: "Kiki", breed: "Cockatiel", type: ShelterPetType.BIRD },
  { name: "Sunny", breed: "Budgerigar", type: ShelterPetType.BIRD },
  { name: "Rio", breed: "Lovebird", type: ShelterPetType.BIRD },
  { name: "Pepper", breed: "Canary", type: ShelterPetType.BIRD },
  { name: "Puffy", breed: "Guinea Pig", type: ShelterPetType.RODENT },
  { name: "Hazel", breed: "Syrian Hamster", type: ShelterPetType.RODENT },
  { name: "Oreo", breed: "Fancy Rat", type: ShelterPetType.RODENT },
  { name: "Coco", breed: "Dwarf Rabbit", type: ShelterPetType.RODENT },
];

export class PoolPetGeneratorService implements IPetGeneratorService {
  constructor(private readonly random: () => number = Math.random) {}
  generate(shelterId: number, now: Date): Omit<ShelterPet, "id"> {
    const item = pool[Math.floor(this.random() * pool.length)];
    return { shelterId, ...item, birthYear: now.getFullYear() - (1 + Math.floor(this.random() * 10)), status: ShelterPetStatus.AVAILABLE, addedAt: now.toISOString() };
  }
}
