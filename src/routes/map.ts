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
    service: unknown;
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

MapRouter.get("/search", async (req: Request<unknown, unknown, unknown, SearchRequest>, res) => {
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
});

interface AddressRequest {
  lon: number;
  lat: number;
}

interface AddressResponse {
  service: unknown;
  status: string;
  result: { zipcode: string; text: string; structure: string }[];
}

const addressMap = new Map<string, AddressResponse["result"]>();

MapRouter.get("/address", async (req: Request<unknown, unknown, unknown, AddressRequest>, res) => {
  try {
    const { lon, lat } = req.query;
    const point = `${lon},${lat}`;

    if (!lon || !lat) {
      return res.status(400).send("좌표값이 올바르지 않습니다.");
    }

    const cached = addressMap.get(point);

    if (cached) {
      return res.send(cached);
    }

    const response: AxiosResponse<AddressResponse> = await axios({
      method: "GET",
      url: `http://api.vworld.kr/req/address`,
      params: {
        service: "address",
        verison: "2.0",
        key: "1B4CE4D9-5DDC-399B-97DC-D3DB9625DE6F",
        request: "GetAddress",
        type: "both",
        point,
        zipcode: true,
        simple: true,
      },
    });

    if (addressMap.size > 100) {
      addressMap.clear();
    }

    addressMap.set(point, response.data.result);

    return res.send(response.data.result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default MapRouter;
