import { PokemonSpecies } from './pokemonSpecies';
import cpMultipliers from '../data/cpMultipliers.json';

export class Pokemon {
  constructor(
    public species: PokemonSpecies,
    public level: number,
    public attackIv: number,
    public defenseIv: number,
    public staminaIv: number) {
  }

  public get attack(): number {
    return this.species.baseAttack + this.attackIv;
  }

  public get defense(): number {
    return this.species.baseDefense + this.defenseIv;
  }

  public get stamina(): number {
    return this.species.baseStamina + this.staminaIv;
  }

  public get cpMultiplier(): number {
    return cpMultipliers.byLevel[(this.level - 1) * 2];
  }

  public get cp(): number {
    const rawCp = (
        this.attack * (Math.sqrt(this.defense) * Math.sqrt(this.stamina) * Math.pow(this.cpMultiplier, 2))
      ) / 10;
    return Math.floor(Math.max(rawCp, 10));
  }
}
