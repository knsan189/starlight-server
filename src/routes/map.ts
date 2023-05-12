import axios, { AxiosResponse } from "axios";
import { Request, Router } from "express";
import { getConnection } from "../config/db.config.js";

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
        key: "252D4250-1B2B-3678-8E96-E545CC8A12B3",
        type: "PLACE",
        query: keyword,
        request: "search",
      },
    });

    if (!response.data.response.result) {
      return res.send("검색 결과가 없습니다.");
    }

    const result: Place[] = [];
    const addressArr: string[] = [];

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
  response: {
    service: unknown;
    status: string;
    result: { zipcode: string; text: string; structure: string }[];
  };
}

const addressMap = new Map<string, AddressResponse["response"]["result"]>();

MapRouter.get("/address", async (req: Request<unknown, unknown, unknown, AddressRequest>, res) => {
  try {
    const { lon, lat } = req.query;

    if (!lon || !lat) {
      return res.status(400).send("좌표값이 올바르지 않습니다.");
    }

    const point = `${lon},${lat}`;

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
        key: "7A323BF6-02C6-3043-A9A3-BFF984E9EBF7",
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

    addressMap.set(point, response.data.response.result);
    return res.send(response.data.response.result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

interface StoreRequestBody {
  northEast: {
    lat: number;
    lon: number;
  };
  southWest: {
    lat: number;
    lon: number;
  };
}
MapRouter.post("/storeList", async (req: Request<unknown, unknown, StoreRequestBody>, res) => {
  try {
    const { northEast, southWest } = req.body;
    const x1 = southWest.lon;
    const y1 = southWest.lat;
    const x2 = northEast.lon;
    const y2 = northEast.lat;

    /**
     * 공간 질의 함수 Mysql 지도 함수
     * https://dev.mysql.com/doc/refman/5.7/en/spatial-relation-functions-mbr.html
     */
    const sql =
      `SELECT * ` +
      `FROM store ` +
      `WHERE MBRCONTAINS(ST_GeomFromText('Polygon((${x1} ${y1},${x1} ${y2}, ${x2} ${y2}, ${x2} ${y1}, ${x1} ${y1}))'), ST_GEOMFROMTEXT(CONCAT('Point(',store.longitude,' ', store.latitude,')')))`;

    // const sql2 =
    //   `SELECT * ` +
    //   `FROM store ` +
    //   `WHERE store.longitude > ${x1} ` +
    //   `AND store.latitude > ${y1} ` +
    //   `AND store.longitude < ${x2} ` +
    //   `AND store.latitude < ${y2} `;

    const response = await new Promise((resolve, reject) => {
      getConnection((connection) => {
        connection.query(sql, (error, result) => {
          if (error) reject(error);
          resolve(result);
        });
        connection.release();
      });
    });

    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default MapRouter;
