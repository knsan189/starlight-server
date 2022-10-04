import axios from "axios";
import * as cheerio from "cheerio";
import { Jewel, UserData } from "../@types/types";

const tagRegex = /<[^>]*>?/g;

export default async function userScraper(
  nickname: string
): Promise<UserData | null> {
  try {
    const response = await axios({
      method: "get",
      url: `https://lostark.game.onstove.com/Profile/Character/${encodeURI(
        nickname
      )}`,
    });

    if (!response) throw new Error("로스트아크 서버 점검중입니다.");

    const parseHtml = response.data
      .replace("<!DOCTYPE html>", "")
      .replace(/\r?\n|\r/g, "");

    const $ = cheerio.load(parseHtml);

    const charClass = $(".profile-character-info__img").attr("alt");

    if (!charClass || !charClass.length)
      throw new Error("존재하지 않는 캐릭터명 입니다.");

    const itemLevel = $(".level-info2__expedition")
      .text()
      .replace("장착 아이템 레벨Lv.", "")
      .replace(",", "");
    const charLevel = $(".level-info__item")
      .text()
      .replace(/[^0-9]/g, "");
    const serverName = $(".profile-character-info__server")
      .text()
      .replace("@", "");
    const guildName = $(".game-info__guild").text().substring(2);
    const charImg = $(".profile-equipment__character img").attr("src");

    const engraveElement = $(".profile-ability-engrave span");
    const engraveArray: string[] = [];

    engraveElement.each((index) => {
      const text = engraveElement.eq(index).text();
      if (text) engraveArray.push(text);
    });

    const abilityElement = $(".profile-ability-battle span");
    const abilityArray: string[] = [];

    abilityElement.each((index) => {
      const text = abilityElement.eq(index).text();
      if (text) abilityArray.push(text);
    });

    const script = $("script");
    const equipmentArray: string[] = [];
    const jewelArray: Jewel[] = [];
    let text = script.eq(2).text();

    if (text.includes("$.Profile =")) {
      text = text.replace("$.Profile =", "");
      const { Equip, GemSkillEffect } = JSON.parse(
        text.substring(0, text.length - 1)
      );
      const equipment = Equip;
      Object.keys(equipment).forEach((key) => {
        if (!key.includes("Gem")) {
          const itemNum = parseInt(key.slice(-2), 10);
          if (itemNum <= 5) {
            equipmentArray.push(
              equipment[key].Element_000.value.replace(/<[^>]*>?/g, "")
            );
          }
        }
      });

      Object.keys(Equip).forEach((key, index) => {
        if (key.includes("Gem")) {
          const jewelData = Equip[key];
          const jewelName = jewelData.Element_000.value.replace(tagRegex, "");
          const jewelImg = `https://cdn-lostark.game.onstove.com/${jewelData.Element_001.value.slotData.iconPath}`;
          const jewelLevel = jewelData.Element_001.value.slotData.rtString;
          const jewelSkill = GemSkillEffect.find(
            ({ EquipGemSlotIndex }) => EquipGemSlotIndex === index
          ).SkillDesc.replace(tagRegex, "");
          const jewelGrade = jewelData.Element_001.value.slotData.iconGrade;
          jewelArray.push({
            name: jewelName,
            img: jewelImg,
            level: jewelLevel,
            skill: jewelSkill,
            grade: jewelGrade,
          });
        }
      });
    }

    return {
      charLevel,
      charClass,
      charImg,
      itemLevel,
      serverName,
      guildName,
      equipments: equipmentArray,
      abilities: abilityArray,
      engraves: engraveArray,
      jewels: jewelArray,
    };
  } catch (error) {
    return null;
  }
}
