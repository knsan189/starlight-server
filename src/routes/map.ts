import axios, { AxiosResponse } from "axios";
import { Request, Router } from "express";

const MapRouter = Router();

interface SearchRequest {
  keyword: string;
}

interface Place {
  id: string;
  title: string;
  category: string;
  address: {
    road: string;
    parcel: string;
  };
  point: {
    x: string;
    y: string;
  };
}

interface VworldSearchResponse {
  response: {
    service: any;
    status: string;
    record: {
      total: string;
      time: string;
    };
    page: {
      total: string;
      current: string;
      size: 1;
    };
    result?: PlaceResult;
  };
}

interface PlaceResult {
  crs: string;
  type: string;
  items: Place[];
}

const searchMap = new Map<string, Place[]>();

MapRouter.get(
  "/search",
  async (req: Request<unknown, unknown, unknown, SearchRequest>, res) => {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).send("검색어를 제대로 입력해주세요.");
      }

      const cached = searchMap.get(keyword);

      if (cached) {
        return res.send(cached);
      }

      const response: AxiosResponse<VworldSearchResponse> = await axios({
        url: "http://api.vworld.kr/req/search",
        method: "GET",
        params: {
          key: "1B4CE4D9-5DDC-399B-97DC-D3DB9625DE6F",
          type: "PLACE",
          query: keyword,
          request: "search",
        },
      });

      if (!response.data.response.result) {
        return res.send("검색 결과가 없습니다.");
      }

      const result: Place[] = [];
      const addressArr = [];

      response.data.response.result.items.forEach((item) => {
        if (item.address.road && !addressArr.includes(item.address.road)) {
          result.push(item);
          addressArr.push(item.address.road);
        }
      });

      if (searchMap.size > 100) {
        searchMap.clear();
      }

      searchMap.set(keyword, result);

      return res.send(result);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
);

export default MapRouter;
