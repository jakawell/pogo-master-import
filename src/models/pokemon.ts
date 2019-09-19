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
    return (this.species.baseAttack + this.attackIv) * this.cpMultiplier;
  }

  public get defense(): number {
    return (this.species.baseDefense + this.defenseIv) * this.cpMultiplier;
  }

  public get stamina(): number {
    return (this.species.baseStamina + this.staminaIv) * this.cpMultiplier;
  }

  public get cpMultiplier(): number {
    return cpMultipliers.byLevel[(this.level - 1) * 2];
  }

  public get cp(): number {
    const basicAttack = this.species.baseAttack + this.attackIv;
    const basicDefense = this.species.baseDefense + this.defenseIv;
    const basicStamina = this.species.baseStamina + this.staminaIv;
    const rawCp = (
        basicAttack * (Math.sqrt(basicDefense) * Math.sqrt(basicStamina) * Math.pow(this.cpMultiplier, 2))
      ) / 10;
    return Math.floor(Math.max(rawCp, 10));
  }
}
