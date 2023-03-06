interface GuardianRaid {
  Name: string;
  Description: string;
  MinCharacterLevel: number;
  MinItemLevel: number;
  RequiredClearRaid: string;
  StartTime: string;
  EndTime: string;
  Image: string;
}

interface RewardItem {
  ExpeditionItemLevel: number;
}

interface Abyss {
  Name: string;
  Description: string;
  MinCharacterLevel: number;
  MinItemLevel: number;
  AreaName: string;
  StartTime: string;
  EndTime: string;
  Image: string;
}
