import axios, { CancelTokenSource } from "axios";
import { Router } from "express";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { PUBLIC_PATH } from "../config/path.js";
import { promisify } from "util";
import { Stream } from "stream";

const TileRouter = Router();
const finished = promisify(Stream.finished);

const VWORLD_KEY = "4450C4EB-47F4-3116-BA47-C6010C732ABE";

const layers = [{ type: "Base" }, { type: "Satellite" }, { type: "Hybrid" }];

const CancelToken = axios.CancelToken;
let source: CancelTokenSource;

layers.forEach(({ type }) => {
  TileRouter.get(`/${type}/:z/:y/:x`, async (req, res) => {
    try {
      source = CancelToken.source();
      const { z, y, x } = req.params;
      const dir = `${PUBLIC_PATH}/tileset/${type}`;
      const zdir = `${dir}/${z}`;
      const ydir = `${dir}/${z}/${y}`;
      const xdir = `${dir}/${z}/${y}/${x}`;

      const response = await axios({
        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/${type}/${z}/${y}/${x}`,
        responseType: "stream",
        cancelToken: source.token,
      });

      if (!response.data) {
        return res.status(404).send("not found");
      }

      if (!existsSync(dir)) {
        mkdirSync(dir);
      }

      if (!existsSync(zdir)) {
        mkdirSync(zdir);
      }

      if (!existsSync(ydir)) {
        mkdirSync(ydir);
      }

      const writer = createWriteStream(xdir);
      response.data.pipe(writer);
      await finished(writer);
      writer.destroy();
      return res.send(readFileSync(xdir));
    } catch (error) {
      return res.status(500).send(error);
    }
  });
});

export default TileRouter;
