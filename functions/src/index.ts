import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";

const apiClient = axios.create({
  baseURL: FOOTBALL_DATA_BASE_URL,
  headers: {"X-Auth-Token": API_KEY},
});

// ─── Fetch & store all EPL teams ───────────────────────────────────
export const fetchEplTeams = onRequest(async (req, res) => {
  try {
    logger.info("Fetching EPL teams from football-data.org");

    const response = await apiClient.get("/competitions/PL/teams");
    const {competition, season, teams} = response.data;

    const batch = db.batch();

    // Store competition metadata
    const competitionRef = db.collection("competitions").doc("PL");
    batch.set(competitionRef, {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      emblem: competition.emblem,
      country: competition.area?.name || "England",
      currentSeason: {
        id: season.id,
        startDate: season.startDate,
        endDate: season.endDate,
        currentMatchday: season.currentMatchday,
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    // Store each team
    for (const team of teams) {
      const teamRef = db.collection("teams").doc(String(team.id));
      batch.set(teamRef, {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
        address: team.address,
        website: team.website,
        founded: team.founded,
        clubColors: team.clubColors,
        venue: team.venue,
        competitionCode: "PL",
        coach: team.coach ? {
          id: team.coach.id,
          firstName: team.coach.firstName,
          lastName: team.coach.lastName,
          name: team.coach.name,
          dateOfBirth: team.coach.dateOfBirth,
          nationality: team.coach.nationality,
          contract: team.coach.contract || null,
        } : null,
        squadCount: team.squad?.length || 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    }

    await batch.commit();

    logger.info(`Stored ${teams.length} EPL teams`);
    res.json({
      success: true,
      teamsCount: teams.length,
      season: season.startDate + " - " + season.endDate,
    });
  } catch (error: any) {
    logger.error("Error fetching EPL teams", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ─── Fetch & store all players for all EPL teams ───────────────────
export const fetchEplPlayers = onRequest(async (req, res) => {
  try {
    logger.info("Fetching EPL teams + squads from football-data.org");

    const response = await apiClient.get("/competitions/PL/teams");
    const {teams} = response.data;

    let totalPlayers = 0;
    const teamSummaries: {team: string; players: number}[] = [];

    // football-data.org free tier: 10 req/min
    // The /competitions/PL/teams endpoint already includes squad data
    for (const team of teams) {
      const squad = team.squad || [];
      const batch = db.batch();

      for (const player of squad) {
        const playerRef = db.collection("players").doc(String(player.id));
        batch.set(playerRef, {
          id: player.id,
          name: player.name,
          firstName: player.firstName || null,
          lastName: player.lastName || null,
          dateOfBirth: player.dateOfBirth,
          nationality: player.nationality,
          position: player.position,
          shirtNumber: player.shirtNumber || null,
          teamId: team.id,
          teamName: team.name,
          teamTla: team.tla,
          competitionCode: "PL",
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, {merge: true});
      }

      await batch.commit();
      totalPlayers += squad.length;
      teamSummaries.push({team: team.name, players: squad.length});
    }

    logger.info(`Stored ${totalPlayers} players across ${teams.length} teams`);
    res.json({
      success: true,
      totalPlayers,
      teamsCount: teams.length,
      teams: teamSummaries,
    });
  } catch (error: any) {
    logger.error("Error fetching EPL players", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
