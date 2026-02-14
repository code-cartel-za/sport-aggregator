import axios, {AxiosInstance} from "axios";

export const footballDataClient: AxiosInstance = axios.create({
  baseURL: "https://api.football-data.org/v4",
  headers: {"X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY || ""},
});

export const apiFootballClient: AxiosInstance = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {"x-apisports-key": process.env.API_FOOTBALL_KEY || ""},
});

export const fplClient: AxiosInstance = axios.create({
  baseURL: "https://fantasy.premierleague.com/api",
  headers: {"User-Agent": "sport-aggregator/1.0"},
});

export const openF1Client: AxiosInstance = axios.create({
  baseURL: "https://api.openf1.org/v1",
});

export const jolpicaClient: AxiosInstance = axios.create({
  baseURL: "https://api.jolpi.ca/ergast/f1",
});
