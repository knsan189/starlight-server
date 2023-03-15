import axios, { AxiosResponse } from "axios";

interface GetGuardiansRepsonse {
  Raids: GuardianRaid[];
  RewardItems: RewardItem[];
}

interface GetUserResponse {
  profile: Profile;
  equipment: Equipment[];
  engravings: { Engravings: Engraving[]; Effects: Effect[] };
  gems: { Gems: Gem[]; Effects: Effect[] };
  cards: { Cards: Card[]; Effects: Effect[] };
}

type GetAbyssResponse = Abyss[];

type GetCalendarResponse = Calendar[];

const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAxODc2MTQifQ.KBFhhv0IKI63gs0oVLoPHAfskMtBSEn5JbsjioMNaM-hSlwOuV2M0MGZVoQbSu8hOPbaJ7aILEenrrBnrI7oheuY78GVQxpriSujI4eyZtvnyq7-HEyQsHTBw3QBg4InWSVJGsvFFggIG9Z_Ce9QZsFVU_sHwTU2GN747CVA9TGt3KBfsIzqYdgAHRq6T1Y9GhCIfM84a-QGAjKss1C4hl83MiaVxDyJAArKLFzgg-2Y14PMiBXTT-6lvWCx0EGX3K1-DcJ3XIVPww-ud1_TVUDYz-YEB--itbcccY66o272xEhEapC5TJEQVl8djZ55-4v-Qnu_4qKyChxyu9hjcg";

const resultMap = new Map<
  "guardian-raids" | "abyss" | "calendar",
  GetGuardiansRepsonse | GetAbyssResponse | { response: GetCalendarResponse; timeStamp: string }
>();

export default class LostarkService {
  private static instance = axios.create({
    baseURL: "https://developer-lostark.game.onstove.com",
    headers: {
      authorization: `bearer ${API_KEY}`,
    },
  });

  public static getGuardians(): Promise<GetGuardiansRepsonse> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const cache = resultMap.get("guardian-raids") as GetGuardiansRepsonse;

          if (cache) {
            const endTime = new Date(cache.Raids[0].EndTime).getTime();
            const now = Date.now();

            if (endTime > now) {
              resolve(cache);
              return;
            }
          }

          const response: AxiosResponse<GetGuardiansRepsonse> = await LostarkService.instance({
            method: "GET",
            url: "/gamecontents/challenge-guardian-raids",
          });

          resultMap.set("guardian-raids", response.data);
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  public static getAbyss(): Promise<GetAbyssResponse> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const cache = resultMap.get("abyss") as GetAbyssResponse;

          if (cache) {
            const endTime = new Date(cache[0].EndTime).getTime();
            const now = Date.now();

            if (endTime > now) {
              resolve(cache);
              return;
            }
          }

          const response: AxiosResponse<GetAbyssResponse> = await LostarkService.instance({
            method: "GET",
            url: "/gamecontents/challenge-abyss-dungeons",
          });
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  public static getCalendar(): Promise<GetCalendarResponse> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const cache = resultMap.get("calendar") as {
            response: GetCalendarResponse;
            timeStamp: string;
          };

          if (cache) {
            const before = new Date(cache.timeStamp);
            const now = new Date();
            if (now.getDate() === before.getDate() || now.getDay() !== 3) {
              resolve(cache.response);
              return;
            }
          }

          const response: AxiosResponse<GetCalendarResponse> = await LostarkService.instance({
            method: "GET",
            url: "/gamecontents/calendar",
          });

          resultMap.set("calendar", { response: response.data, timeStamp: new Date().toString() });
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  public static getUser(userName: string): Promise<GetUserResponse> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const promiseArray = [
            LostarkService.instance({
              url: `/armories/characters/${userName}/profiles`,
            }),
            LostarkService.instance({
              url: `/armories/characters/${userName}/equipment`,
            }),
            LostarkService.instance({
              url: `/armories/characters/${userName}/engravings`,
            }),
            LostarkService.instance({
              url: `/armories/characters/${userName}/gems`,
            }),
            LostarkService.instance({
              url: `/armories/characters/${userName}/cards`,
            }),
          ];
          const [profile, equipment, engravings, gems, cards] = await Promise.all(promiseArray);

          resolve({
            profile: profile.data,
            equipment: equipment.data,
            engravings: engravings.data,
            gems: gems.data,
            cards: cards.data,
          });
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  public static temp() {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          resolve("ok");
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
}
