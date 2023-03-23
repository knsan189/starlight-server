import axios, { AxiosPromise, AxiosResponse } from "axios";

interface GetGuardiansRepsonse {
  Raids: GuardianRaid[];
  RewardItems: RewardItem[];
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface GetUserResponse {
  profile: Profile | null;
  equipment: Equipment[] | null;
  engravings: { Engravings: Engraving[]; Effects: Effect[] } | null;
  gems: { Gems: Gem[]; Effects: Effect[] } | null;
  cards: { Cards: Card[]; Effects: Effect[] } | null;
}

interface SearchAuctionResponse {
  PageNo: number;
  PageSize: number;
  Items: AuctionItem[] | null;
}

interface SearchMarketResponse {
  PageNo: number;
  PageSize: number;
  Items: MarketItem[];
}

type GetAbyssResponse = Abyss[];

type GetCalendarResponse = Calendar[];

const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAxODc2MTQifQ.KBFhhv0IKI63gs0oVLoPHAfskMtBSEn5JbsjioMNaM-hSlwOuV2M0MGZVoQbSu8hOPbaJ7aILEenrrBnrI7oheuY78GVQxpriSujI4eyZtvnyq7-HEyQsHTBw3QBg4InWSVJGsvFFggIG9Z_Ce9QZsFVU_sHwTU2GN747CVA9TGt3KBfsIzqYdgAHRq6T1Y9GhCIfM84a-QGAjKss1C4hl83MiaVxDyJAArKLFzgg-2Y14PMiBXTT-6lvWCx0EGX3K1-DcJ3XIVPww-ud1_TVUDYz-YEB--itbcccY66o272xEhEapC5TJEQVl8djZ55-4v-Qnu_4qKyChxyu9hjcg";

const resultMap = new Map<string, any>();

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

  public static searchAuction(ItemName: string): Promise<SearchAuctionResponse> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const key = `auction-${ItemName}`;
          const cache = resultMap.get(key) as {
            timestamp: string;
            response: SearchAuctionResponse;
          };

          if (cache) {
            const before = new Date(cache.timestamp).getDate();
            const now = new Date(cache.timestamp).getDate();
            if (before === now) {
              resolve(cache.response);
              return;
            }
            resultMap.delete(key);
          }

          const response = await LostarkService.instance({
            url: "/auctions/items",
            method: "POST",
            data: {
              ItemName,
              CategoryCode: 210000, // 보석 카테고리 코드
            },
          });

          resultMap.set(key, { timestamp: new Date().toString(), response: response.data });
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  public static searchMarket(ItemName: string) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const key = `market-${ItemName}`;

          const cache = resultMap.get(key) as {
            timestamp: string;
            response: MarketItem[];
          };

          if (cache) {
            const before = new Date(cache.timestamp).getDate();
            const now = new Date(cache.timestamp).getDate();
            if (before === now) {
              resolve(cache.response);
              return;
            }
            resultMap.delete(key);
          }

          const categoryArr = [20000, 40000, 50000, 60000, 70000, 90000, 100000];
          const promiseArr: AxiosPromise<SearchMarketResponse>[] = [];

          categoryArr.forEach((num) => {
            promiseArr.push(
              LostarkService.instance({
                url: "/markets/items",
                method: "POST",
                data: {
                  ItemName,
                  CategoryCode: num,
                  Sort: "GRADE",
                  SortCondition: "ASC",
                  PageSize: 5,
                },
              }),
            );
          });

          const result: MarketItem[] = [];
          const responses = await Promise.all(promiseArr);

          responses.forEach((response) => {
            response.data.Items.forEach((item) => {
              if (result.length <= 10) {
                result.push(item);
              }
            });
          });

          resultMap.set(key, { timestamp: new Date().toString(), response: result });
          resolve(result);
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
